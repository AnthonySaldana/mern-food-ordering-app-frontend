import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

type Props = {
  children: React.ReactNode;
  showHero?: boolean;
};

const Layout = ({ children, showHero = false }: Props) => {
  return (
    // <div className="flex flex-col min-h-screen bg-[#F7F4E5]">
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      {showHero && <Hero />}
      <div className="container mx-auto flex-1 py-5 px-5"
        style={window.location.pathname.includes('/influencer/') && window.location.pathname.includes('/mealplans/') ? { padding: '0' } : undefined}>
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
