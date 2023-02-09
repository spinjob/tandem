import { Global } from '@mantine/core';
import vulfSansMedium from './public/fonts/Vulf_Sans/Web/Vulf_Sans-Medium.woff2';
import visueltRegular from './public/fonts/Visuelt/visuelt-regular-pro/visuelt/web/pro/visuelt-regular-pro.woff2';
import visueltMedium from './public/fonts/Visuelt/visuelt-medium-pro/visuelt/web/pro/visuelt-medium-pro.woff2';

export function CustomFonts() {
  return (
    <Global
      styles={[
        {
          '@font-face': {
            fontFamily: 'Vulf Sans',
            src: `url('${vulfSansMedium}') format("woff2")`,
            fontWeight: 500,
            fontStyle: 'medium'
          },
          '@font-face': {
            fontFamily: 'Visuelt',
            src: `url('${visueltRegular}') format("woff2")`,
            fontWeight: 500,
            fontStyle: 'normal'
          },
          '@font-face': {
            fontFamily: 'Visuelt',
            src: `url('${visueltMedium}') format("woff2")`,
            fontWeight: 500,
            fontStyle: 'medium'
          },
        }
      ]}
    />
  );
}