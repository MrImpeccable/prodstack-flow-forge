
const About = () => {
  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 dark:text-white">
                About Us
              </h2>
              <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                <p>
                  We're a small team of builders and product thinkers creating tools we wish we had in our own product careers.
                </p>
                <p>
                  ProdStack was born from the need for focus — a workspace that doesn't just store ideas but helps shape them.
                </p>
                <p className="font-medium text-red-600 dark:text-red-400">
                  We believe product management should feel strategic, not scattered.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl">
                <img 
                  src="/lovable-uploads/3b4d22fa-d92b-49a4-9d92-263e24102342.png" 
                  alt="ProdStack Logo - Visual identity reflecting clarity and structure" 
                  className="h-16 w-auto mx-auto mb-6"
                />
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Our visual identity reflects the clarity and structure we bring to product management workflows.
                </p>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
