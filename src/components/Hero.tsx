
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-8 pb-16 md:pt-10 md:pb-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold font-heading text-gray-900 dark:text-white leading-tight">
                <span className="text-red-600">Clarity</span> Before Code.
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Build user personas, define problems, and generate product docs — all in one simple workspace for product managers.
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-lg text-gray-700 dark:text-gray-400">
                Say goodbye to scattered workflows. ProdStack gives PMs a focused, AI-powered environment to understand users, align teams, and move faster — without switching tools.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 text-lg"
                onClick={() => navigate('/auth')}
              >
                Try the Persona Builder
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 px-8 py-4 text-lg font-semibold"
                onClick={() => navigate('/auth')}
              >
                Explore the Demo
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-1 border border-gray-200 dark:border-gray-700">
              <img 
                src="/lovable-uploads/246fa3f5-cb48-4d3c-bb4d-00db1797f1fe.png"
                alt="ProdStack Product Mockup - Persona Builder and Problem Space Canvas"
                className="w-full h-auto rounded-xl"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full blur-2xl"></div>
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-red-50 dark:bg-red-900/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
