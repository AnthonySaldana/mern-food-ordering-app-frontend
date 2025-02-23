import { useState } from 'react';
import tut1 from '@/assets/tut1.png';
import tut2 from '@/assets/tut2.png';
import tut3 from '@/assets/tut3.png';

const MatchingTutorial = () => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
      <div className="bg-white p-12 rounded-xl max-w-[800px] w-[90%]">
        <div className="flex items-center mb-4 relative">
          <h2 className="m-0 text-lg font-bold w-full text-center">Just a heads up!</h2>
          <button 
            onClick={handleClose}
            className="border-none bg-none text-xl cursor-pointer absolute right-0"
          >
            ×
          </button>
        </div>
        
        <p className="text-center my-4">
          We've filled your cart with as many of your selected plan items as possible. Due to brand availability across stores, you may see some items we couldn't match 100%.
        </p>

        <div className="flex justify-between my-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex-1 text-center px-2">
              <img 
                src={step === 1 ? tut1 : step === 2 ? tut2 : tut3} 
                alt={`Tutorial step ${step}`}
                className="w-full mb-2"
              />
              <div className="relative w-6 h-6 bg-[#00A67E] rounded-full text-white mx-auto my-2">
                {step}
              </div>
              <p className="text-sm my-2">
                {step === 1 && 'For any highlighted items, click to open the store catalogue'}
                {step === 2 && "We'll show you the target item, weight, and options available. Choose any and click 'match'"}
                {step === 3 && "That's it! Your new item is in your cart. Next time you order this plan, we'll remember your order"}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={handleClose}
          className="w-full py-3 bg-[#00A67E] text-white border-none rounded-full cursor-pointer text-base max-w-[100px] mx-auto block"
        >
          Ok
        </button>
      </div>
    </div>
  );
};

export default MatchingTutorial;
