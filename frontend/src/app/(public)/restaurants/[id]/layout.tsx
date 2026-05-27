interface RestaurantLayoutProps {
  children: React.ReactNode;
}

export default async function RestaurantLayout({ children }: RestaurantLayoutProps) {
  return (
    <main>
      {children}
    </main>
  );
}