import React from 'react';
import { Project } from '../../types';
import { ProjectCaseStudyTemplate } from '../../components/project-case-study/ProjectCaseStudyTemplate';

interface DynamicCaseProps {
  project: Project;
  onNavigate: (path: string) => void;
  isAdminPreview?: boolean;
}

export const DynamicCase: React.FC<DynamicCaseProps> = ({ project, onNavigate, isAdminPreview }) => {
  return (
    <div
      className="page-view route-entered"
      data-page="dynamic-case"
      style={{ backgroundColor: '#000000', minHeight: '100vh', width: '100%' }}
    >
      <ProjectCaseStudyTemplate
        project={project}
        onNavigate={onNavigate}
        isAdminPreview={isAdminPreview}
      />
    </div>
  );
};
