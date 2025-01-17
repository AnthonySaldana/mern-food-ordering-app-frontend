import InfluencerRecommendation from './InfluencerRecommendation';

const Footer = () => {
  return (
    <div className="bg-[#50ad40] py-10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="FitBite Logo" className="h-8 w-8" />
          <span className="text-3xl text-white font-bold tracking-tight">
            FitBite
          </span>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <InfluencerRecommendation />
          <div className="flex gap-4">
            <a href="#" className="text-white hover:text-gray-200">
              <i className="fab fa-facebook text-xl"></i>
            </a>
            <a href="#" className="text-white hover:text-gray-200">
              <i className="fab fa-twitter text-xl"></i>
            </a>
            <a href="#" className="text-white hover:text-gray-200">
              <i className="fab fa-instagram text-xl"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
