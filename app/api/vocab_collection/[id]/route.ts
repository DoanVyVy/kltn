import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id } = params;

	return NextResponse.json(
		await prisma.vocabularyCollection.findFirst({
			where: {
				id: parseInt(id),
			},
		})
	);
}
