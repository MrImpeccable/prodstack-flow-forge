
const Features = () => {
  const features = [
    {
      title: "Persona Builder",
      description: "Create, edit, and export rich user personas with avatars, goals, frustrations, and tools."
    },
    {
      title: "Problem Space Canvas",
      description: "Visually map your users' pain points and opportunity areas in a guided format."
    },
    {
      title: "AI Doc Generator",
      description: "Turn your insights into structured PRDs and user stories with one click."
    },
    {
      title: "Clean Project Workspace",
      description: "Keep all personas, problems, and docs in one intuitive space."
    }
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 dark:text-white">
              Why Product Managers Choose ProdStack
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to go from user insights to actionable product documents, all in one focused workspace.
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                >
                  <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
