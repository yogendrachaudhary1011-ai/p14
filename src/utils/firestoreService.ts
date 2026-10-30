import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Project, SiteSettings, ExperienceItem, EducationItem, MediaAsset } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Warning/Notice: ', JSON.stringify(errInfo));
}

// Collections
const PROJECTS_COLL = 'projects';
const SETTINGS_COLL = 'site_settings';
const MEDIA_COLL = 'media';
const EXP_COLL = 'experience';
const EDU_COLL = 'education';

export async function fetchProjectsFromDb(): Promise<Project[] | null> {
  try {
    const snap = await getDocs(collection(db, PROJECTS_COLL));
    if (snap.empty) return null;
    const items: Project[] = [];
    snap.forEach((d) => {
      items.push({ ...(d.data() as Project), id: d.id });
    });
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, PROJECTS_COLL);
    return null;
  }
}

export async function saveProjectToDb(project: Project): Promise<void> {
  const path = `${PROJECTS_COLL}/${project.id}`;
  try {
    await setDoc(doc(db, PROJECTS_COLL, project.id), {
      ...project,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteProjectFromDb(id: string): Promise<void> {
  const path = `${PROJECTS_COLL}/${id}`;
  try {
    await deleteDoc(doc(db, PROJECTS_COLL, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function saveSettingsToDb(settings: SiteSettings): Promise<void> {
  const path = `${SETTINGS_COLL}/global`;
  try {
    await setDoc(doc(db, SETTINGS_COLL, 'global'), {
      ...settings,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveMediaToDb(media: MediaAsset): Promise<void> {
  const path = `${MEDIA_COLL}/${media.id}`;
  try {
    await setDoc(doc(db, MEDIA_COLL, media.id), media);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteMediaFromDb(id: string): Promise<void> {
  const path = `${MEDIA_COLL}/${id}`;
  try {
    await deleteDoc(doc(db, MEDIA_COLL, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeToProjects(onUpdate: (projects: Project[]) => void): () => void {
  return onSnapshot(
    collection(db, PROJECTS_COLL),
    (snap) => {
      if (!snap.empty) {
        const items: Project[] = [];
        snap.forEach((d) => {
          items.push({ ...(d.data() as Project), id: d.id });
        });
        onUpdate(items);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, PROJECTS_COLL);
    }
  );
}
