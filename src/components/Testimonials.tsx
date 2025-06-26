
const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      title: "Senior Product Manager",
      company: "TechFlow",
      country: "🇺🇸",
      avatar: "/lovable-uploads/6fbf03ae-7d5b-44e4-a059-ec7b8c20790d.png",
      quote: "ProdStack cut our discovery phase from weeks to days. The AI document generation is surprisingly good—saves me hours of writing and helps me focus on strategy instead of formatting."
    },
    {
      name: "Marcus Weber",
      title: "Product Lead",
      company: "InnovateLab",
      country: "🇩🇪",
      avatar: "/lovable-uploads/1094e18d-9293-41db-8430-8b025dc10488.png",
      quote: "Finally, a tool that gets the PM workflow. The persona builder and problem canvas work together seamlessly. My stakeholders actually read the PRDs now because they're so clear and structured."
    },
    {
      name: "Priya Sharma",
      title: "Product Manager",
      company: "GrowthCo",
      country: "🇮🇳",
      avatar: "/lovable-uploads/c5892b19-7295-4c77-af2b-962ebd948ecd.png",
      quote: "As a solo PM at a startup, ProdStack is a game-changer. I can build comprehensive user insights and documentation without needing a full UX research team. The clarity it brings is incredible."
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 dark:text-white">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Product managers around the world are shipping faster with ProdStack
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold font-heading text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.title}, {testimonial.company}
                    </p>
                  </div>
                </div>
                <blockquote className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
