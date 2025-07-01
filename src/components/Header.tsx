
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Initialize theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    const root = window.document.documentElement;
    
    if (savedTheme === 'dark') {
      root.classList.add('dark');
    } else if (savedTheme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (systemTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, []);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/lovable-uploads/3b4d22fa-d92b-49a4-9d92-263e24102342.png" 
              alt="ProdStack Logo" 
              className="h-auto w-[140px] md:w-[100px] sm:w-[80px]"
            />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              <span className="text-red-600">Prod</span>Stack
            </h1>
          </button>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              About
            </a>
            <Button 
              onClick={handleGetStarted}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg"
            >
              Get Started
            </Button>
          </nav>

          <button 
            className="md:hidden text-gray-900 dark:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                Pricing
              </a>
              <a href="#about" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                About
              </a>
              <Button 
                onClick={handleGetStarted}
                className="bg-red-600 hover:bg-red-700 text-white w-full"
              >
                Get Started
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
