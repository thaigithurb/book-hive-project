import { notFound } from "next/navigation";
import DetailClient from "./DetailClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getBook(slug: string) {
  const res = await fetch(`${API_URL}/api/v1/books/detail/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.book || null;
}

export default async function DetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const book = await getBook(slug);

  if (!book) {
    notFound();
  }

  return <DetailClient book={book} />;
}
