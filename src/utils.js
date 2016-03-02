import classNames from 'classnames';

export function getCommonClasses(rowIndex, selectedFileIndex) {
  return classNames('selectable', {
    selected: selectedFileIndex === rowIndex
  });
}

export function truncateText(string){
  const truncateLength = 23;
  if (string.length > truncateLength)
    return string.substring(0,truncateLength)+'...';
  else
    return string;
}

export function getFileSizeString(fileSize) {
  return Math.round(fileSize * 100 / 1024 / 1024) / 100 + ' MB';
}
