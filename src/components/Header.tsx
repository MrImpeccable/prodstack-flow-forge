
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-6 py-[10px]">
        <div className="flex items-center justify-between h-[40px]">
          <div className="flex items-center">
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/lovable-uploads/3b4d22fa-d92b-49a4-9d92-263e24102342.png" 
                alt="ProdStack Logo" 
                className="h-auto w-[140px] md:w-[100px] sm:w-[80px]"
              />
              <span className="text-xl font-semibold font-heading text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors">
                ProdStack
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors font-medium">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors font-medium">
              Pricing
            </a>
            <a href="#about" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors font-medium">
              About
            </a>
            <a href="#contact" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors font-medium">
              Contact
            </a>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white font-semibold border-2 border-red-800"
              onClick={() => navigate('/auth')}
            >
              Try the Persona Builder
            </Button>
          </nav>

          {/* Tablet Navigation */}
          <nav className="hidden md:flex lg:hidden items-center space-x-4">
            <a href="#features" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors font-medium text-sm">
              Features
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors font-medium text-sm">
              Pricing
            </a>
            <Button 
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold border-2 border-red-800"
              onClick={() => navigate('/auth')}
            >
              Try Now
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors font-medium">
                How It Works
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors font-medium">
                Pricing
              </a>
              <a href="#about" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors font-medium">
                About
              </a>
              <a href="#contact" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors font-medium">
                Contact
              </a>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white w-full font-semibold border-2 border-red-800"
                onClick={() => navigate('/auth')}
              >
                Try the Persona Builder
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
