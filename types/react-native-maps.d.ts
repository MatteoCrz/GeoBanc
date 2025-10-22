import { MarkerProps } from 'react-native-maps';

declare module 'react-native-maps' {
  export interface MarkerProps {
    clusteringIdentifier?: string;
  }
}
