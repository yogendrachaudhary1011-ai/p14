import React from 'react';
import { Project } from '../../types';
import { ProjectDetailTemplate } from '../../components/project/ProjectDetailTemplate';

interface DynamicCaseProps {
  project: Project;
  onNavigate: (path: string) => void;
}

export const DynamicCase: React.FC<DynamicCaseProps> = ({ project, onNavigate }) => {
  return (
    <div className="page-view route-entered" data-page="dynamic-case" style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      <ProjectDetailTemplate project={project} onNavigate={onNavigate} />
    </div>
  );
};
