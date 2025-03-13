import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
const prisma = new PrismaClient();

export async function GET(request: Request) {
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
	const cols = await prisma.vocabularyCollection.findMany();

	const collectionIds = cols.map((col) => col.id);

	const learnedWords = await prisma.userCollectionProcess.groupBy({
		by: ["vocabularyCollectionId"],
		where: { userId: Number(userWithEmail.userId) },
		_count: { vocabularyCollectionId: true },
	});

	const totalWords = await prisma.collectionDetail.groupBy({
		by: ["collectionId"],
		where: { collectionId: { in: collectionIds } },
		_count: { collectionId: true },
	});

	const learnedWordsMap = new Map(
		learnedWords.map((item) => [
			item.vocabularyCollectionId,
			item._count.vocabularyCollectionId,
		])
	);
	const totalWordsMap = new Map(
		totalWords.map((item) => [item.collectionId, item._count.collectionId])
	);

	const result = cols.map((col) => {
		const total = totalWordsMap.get(col.id) || 0;
		const learned = learnedWordsMap.get(col.id) || 0;
		return {
			...col,
			totalWords: total,
			progress: total > 0 ? Math.floor((learned / total) * 100) : 0,
		};
	});

	return NextResponse.json(result);
}
