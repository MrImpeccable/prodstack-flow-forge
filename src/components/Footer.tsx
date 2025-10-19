
const Footer = () => {
  return (
    <footer className="py-12 bg-[#1C1C1E] text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <img 
                src="/lovable-uploads/3b4d22fa-d92b-49a4-9d92-263e24102342.png" 
                alt="ProdStack Logo" 
                className="h-auto w-[60px] mr-3"
              />
              <span className="text-xl font-bold"><span className="text-[#E63946]">Prod</span>Stack</span>
            </div>
            <p className="text-sm text-gray-400">
              Building the Future of Product Management
            </p>
            <p className="text-sm text-gray-300 mt-1">
              © 2025 ProdStack. Built with precision by Ibrahim Adedeji.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <a 
              href="/"
              className="text-gray-400 hover:text-[#E63946] transition-colors text-sm"
            >
              Home
            </a>
            <a 
              href="/#about"
              className="text-gray-400 hover:text-[#E63946] transition-colors text-sm"
            >
              About
            </a>
            <a 
              href="/#pricing"
              className="text-gray-400 hover:text-[#E63946] transition-colors text-sm"
            >
              Pricing
            </a>
            <a 
              href="/#contact"
              className="text-gray-400 hover:text-[#E63946] transition-colors text-sm"
            >
              Contact
            </a>
            <a 
              href="#"
              className="text-gray-400 hover:text-[#E63946] transition-colors text-sm"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
