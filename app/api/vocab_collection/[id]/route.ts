import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const { id } = params;
	const col = await prisma.vocabularyCollection.findFirst({
		where: {
			id: parseInt(id),
		},
	});
	const totalWords = await prisma.collectionDetail.count({
		where: {
			collectionId: parseInt(id),
		},
	});
	return NextResponse.json({
		...col,
		totalWords: totalWords,
	});
}
