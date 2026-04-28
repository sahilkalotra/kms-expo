import { Asset } from 'expo-asset';
import * as FileSystemLegacy from 'expo-file-system/legacy';

export async function getLocalCourseContentHtml(): Promise<{ html: string; baseUrl?: string }> {
  // NOTE: path is relative to this file (`src/courses/*`) -> project root `assets/*`
  const asset = Asset.fromModule(require('../../../../assets/course-content.html'));
  if (!asset.localUri) {
    await asset.downloadAsync();
  }

  const uri = asset.localUri ?? asset.uri;
  const html = await FileSystemLegacy.readAsStringAsync(uri);
  // don't expose file:// as baseUrl; it triggers attempts to open it on some setups
  return { html, baseUrl: undefined };
}

