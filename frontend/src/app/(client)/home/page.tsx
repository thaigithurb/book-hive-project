import HomeClient from "@/app/components/HomeClient/HomeClient";


const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getBooks() {
  const [featuredRes, newestRes] = await Promise.all([
    fetch(`${API_URL}/api/v1/books/featured`, { cache: "force-cache" }),
    fetch(`${API_URL}/api/v1/books/newest`, { cache: "force-cache" }),
  ]);
  const featuredData = await featuredRes.json();
  const newestData = await newestRes.json();
  return {
    featuredBooks: featuredData.books || [],
    newestBooks: newestData.books || [],
  };
}

export default async function Home() {
  const { featuredBooks, newestBooks } = await getBooks();

  return <HomeClient featuredBooks={featuredBooks} newestBooks={newestBooks} />;
}
