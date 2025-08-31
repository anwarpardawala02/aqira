import React, { useState, useEffect } from 'react';
import './DiffView.css';

interface DiffViewProps {
  contentA: string;
  contentB: string;
  labelA: string;
  labelB: string;
}

const DiffView: React.FC<DiffViewProps> = ({ contentA, contentB, labelA, labelB }) => {
  const [diff, setDiff] = useState<JSX.Element[]>([]);
  
  useEffect(() => {
    // This is a simple character-by-character diff
    // In a real implementation, you'd want to use a better diff algorithm
    // such as diff-match-patch or a React component like react-diff-viewer
    
    const linesA = contentA.split('\n');
    const linesB = contentB.split('\n');
    const maxLines = Math.max(linesA.length, linesB.length);
    
    const diffElements: JSX.Element[] = [];
    
    for (let i = 0; i < maxLines; i++) {
      const lineA = linesA[i] || '';
      const lineB = linesB[i] || '';
      
      if (lineA === lineB) {
        diffElements.push(
          <div key={`line-${i}`} className="diff-line">
            <div className="diff-line-number">{i + 1}</div>
            <div className="diff-line-content">{lineA}</div>
          </div>
        );
      } else {
        diffElements.push(
          <div key={`line-${i}-a`} className="diff-line diff-removed">
            <div className="diff-line-number">{i + 1}</div>
            <div className="diff-line-label">{labelA}</div>
            <div className="diff-line-content">{lineA}</div>
          </div>
        );
        diffElements.push(
          <div key={`line-${i}-b`} className="diff-line diff-added">
            <div className="diff-line-number">{i + 1}</div>
            <div className="diff-line-label">{labelB}</div>
            <div className="diff-line-content">{lineB}</div>
          </div>
        );
      }
    }
    
    setDiff(diffElements);
  }, [contentA, contentB, labelA, labelB]);
  
  return (
    <div className="diff-container">
      <div className="diff-header">
        <div className="diff-title">Comparing {labelA} with {labelB}</div>
      </div>
      <div className="diff-content">{diff}</div>
    </div>
  );
};

export default DiffView;
