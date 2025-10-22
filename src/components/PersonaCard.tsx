
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FileText, Download } from 'lucide-react';
import { exportPersonaToWord, exportPersonaToPNG } from '@/utils/documentExports';

interface Persona {
  id: string;
  name: string;
  avatar_url?: string;
  age?: number;
  role?: string;
  goals?: string[];
  frustrations?: string[];
  tools?: string[];
  bio?: string;
}

interface PersonaCardProps {
  persona: Persona;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ persona }) => {
  const handleExportWord = () => {
    exportPersonaToWord(persona);
  };

  const handleExportPNG = () => {
    exportPersonaToPNG(persona);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 transition-all duration-300 shadow-lg hover:shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={persona.avatar_url} alt={persona.name} />
            <AvatarFallback className="bg-red-600 text-white text-lg">
              {getInitials(persona.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl text-gray-900 dark:text-white mb-1">
              {persona.name}
            </CardTitle>
            {persona.role && (
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {persona.role}
              </p>
            )}
            {persona.age && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Age: {persona.age}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {persona.bio && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Bio</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {persona.bio}
            </p>
          </div>
        )}
        
        {persona.goals && persona.goals.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Goals</h4>
            <div className="flex flex-wrap gap-2">
              {persona.goals.map((goal, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  {goal}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {persona.frustrations && persona.frustrations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Frustrations</h4>
            <div className="flex flex-wrap gap-2">
              {persona.frustrations.map((frustration, index) => (
                <Badge key={index} variant="secondary" className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                  {frustration}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {persona.tools && persona.tools.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tools</h4>
            <div className="flex flex-wrap gap-2">
              {persona.tools.map((tool, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportWord}
            className="flex-1 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export Word
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportPNG}
            className="flex-1 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PNG
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonaCard;
