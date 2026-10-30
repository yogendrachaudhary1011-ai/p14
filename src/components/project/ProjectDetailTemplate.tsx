import React from 'react';
import { Project } from '../../types';
import { ProjectCaseStudyTemplate } from '../project-case-study/ProjectCaseStudyTemplate';

interface ProjectDetailTemplateProps {
  project: Project;
  onNavigate?: (path: string) => void;
  isAdminPreview?: boolean;
}

export const ProjectDetailTemplate: React.FC<ProjectDetailTemplateProps> = ({
  project,
  onNavigate,
  isAdminPreview
}) => {
  return (
    <ProjectCaseStudyTemplate
      project={project}
      onNavigate={onNavigate}
      isAdminPreview={isAdminPreview}
    />
  );
};
