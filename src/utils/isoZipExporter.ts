import JSZip from 'jszip';
import {
  ISO_21500_FOLDER_STRUCTURE,
  generateRequiredDocumentsText,
  generateMasterIsoReadme,
  getAllIsoFolderNodes,
  IsoFolderNode
} from '../data/iso21500Structure';

/**
 * Packs the complete ISO 21500 directory tree into a .zip archive,
 * placing a clean REQUIRED_DOCUMENTS.txt in each folder and subfolder.
 */
export async function downloadIso21500Zip(projectName = 'Project'): Promise<void> {
  const zip = new JSZip();
  const rootFolderName = `ISO_21500_Governance_Structure`;
  const root = zip.folder(rootFolderName);

  if (!root) {
    throw new Error('Failed to create root folder in ZIP archive.');
  }

  // 1. Add Master Readme at root
  root.file('README_ISO21500_GOVERNANCE_STRUCTURE.txt', generateMasterIsoReadme());

  // 2. Add each folder and subfolder with its specific REQUIRED_DOCUMENTS.txt
  const allNodes = getAllIsoFolderNodes();

  for (const node of allNodes) {
    const manifestContent = generateRequiredDocumentsText(node);
    root.file(`${node.path}/REQUIRED_DOCUMENTS.txt`, manifestContent);
  }

  // 3. Generate and trigger download
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `ISO21500_Standard_Folder_Structure_${projectName.replace(/[^a-zA-Z0-9-_]/g, '_')}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a single text file manifest for a specific folder
 */
export function downloadSingleFolderManifest(folder: IsoFolderNode): void {
  const content = generateRequiredDocumentsText(folder);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${folder.folderName}_REQUIRED_DOCUMENTS.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
