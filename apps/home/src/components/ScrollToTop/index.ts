import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface IProps {
  children: React.ReactElement;
}

export default (props: IProps): React.ReactElement => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const main = document.getElementById('root');
    if (main) {
      main.scrollTo({ top: 0 });
    }
  }, [location]);

  return props.children;
};
