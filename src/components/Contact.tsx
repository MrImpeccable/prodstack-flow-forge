
const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 dark:text-white">
            Contact Us
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Got feedback, questions, or just want to connect?
          </p>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <a 
                href="mailto:hello@prodstack.app"
                className="flex items-center justify-center space-x-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-2xl">📧</span>
                <div className="text-left">
                  <div className="font-semibold font-heading text-gray-900 dark:text-white">Email</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">hello@prodstack.app</div>
                </div>
              </a>
              
              <a 
                href="https://www.prodstack.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-2xl">🌐</span>
                <div className="text-left">
                  <div className="font-semibold font-heading text-gray-900 dark:text-white">Website</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">www.prodstack.app</div>
                </div>
              </a>
              
              <a 
                href="https://twitter.com/prodstack"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-2xl">💬</span>
                <div className="text-left">
                  <div className="font-semibold font-heading text-gray-900 dark:text-white">Twitter</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">@prodstack</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
