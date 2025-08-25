export interface DroneData {
  type: string;
  features: Array<{
    type: string;
    properties: {
      serial: string;
      registration: string;
      Name: string;
      altitude: number;
      pilot: string;
      organization: string;
      yaw: number;
    };
    geometry: {
      coordinates: [number, number];
      type: string;
    };
  }>;
}

export interface DronePosition {
  lat: number;
  lng: number;
  altitude: number;
  yaw: number;
  timestamp: number;
  name: string;
  pilot: string;
  organization: string;
  serial: string;
}

export interface DroneJourney {
  registrationId: string;
  positions: DronePosition[];
  currentPosition: DronePosition | null;
  lastUpdated: number;
  serial: string;
  pilot: string;
  organization: string;
}

export interface DroneListPanelProps {
  drones: Map<string, DroneJourney>;
  isOpen: boolean;
  onClose: () => void;
  selectedDroneId: string | null;
  onDroneSelect: (registrationId: string, coordinates: [number, number]) => void;
}

export interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

export type ViewType = 'dashboard' | 'map';
