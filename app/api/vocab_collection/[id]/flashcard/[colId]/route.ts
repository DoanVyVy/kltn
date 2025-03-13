import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
const prisma = new PrismaClient();

export async function POST(
	request: Request,
	{ params }: { params: { id: string; colId: string } }
) {
	const supabase = createRouteHandlerClient({ cookies });

	const {
		data: { session },
	} = await supabase.auth.getSession();
	if (!session || !session.user || !session.user.email) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userWithEmail = await prisma.user.findUnique({
		where: {
			email: session.user.email,
		},
	});
	if (!userWithEmail) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const { id, colId } = params;
	const exists = await prisma.userCollectionProcess.findFirst({
		where: {
			vocabularyCollectionId: parseInt(id),
			userId: Number(userWithEmail.userId),
			collectionDetailId: parseInt(colId),
		},
	});
	if (!exists) {
		await prisma.userCollectionProcess.create({
			data: {
				userId: Number(userWithEmail.userId),
				vocabularyCollectionId: parseInt(id),
				collectionDetailId: parseInt(colId),
				isCorrect: true,
			},
		});
	}

	return NextResponse.json({ success: true });
}
