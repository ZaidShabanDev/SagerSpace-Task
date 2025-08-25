import type { DroneListPanelProps } from '@/types';
import { Navigation, X } from 'lucide-react';
import { type JSX } from 'react';

export function DroneSidebar({
  drones,
  isOpen,
  onClose,
  selectedDroneId,
  onDroneSelect,
}: DroneListPanelProps): JSX.Element {
  const getDroneColor = (registration: string): string => {
    const registrationParts = registration.split('-');
    const isGreen = registrationParts[1]?.startsWith('B');
    return isGreen ? '#24ff00' : '#FF000f';
  };

  const droneList = Array.from(drones.values()).filter(
    (journey) => journey.currentPosition && journey.currentPosition.altitude > 0
  );

  if (!isOpen) return <></>;

  return (
    <div className="absolute left-0 top-0 z-[1000] flex h-screen w-80 animate-[slideIn_0.3s_ease-out] flex-col border-r border-black/10 bg-black font-sans shadow-[2px_0_12px_rgba(0,0,0,0.15)]">
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/10 bg-black/80 px-5 py-4">
        <div>
          <h2 className="m-0 text-lg font-semibold text-white">Drones Flying</h2>
        </div>
        <button
          onClick={onClose}
          className="flex cursor-pointer items-center justify-center rounded-md border-none bg-transparent p-2 text-white transition-all duration-200 hover:bg-black/5 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Drone List */}
      <div className="flex-1 overflow-y-auto py-3">
        {droneList.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-white">No active drones</div>
        ) : (
          droneList.map((journey) => {
            const isSelected = selectedDroneId === journey.registrationId;
            const droneColor = getDroneColor(journey.registrationId);

            return (
              <div
                key={journey.registrationId}
                onClick={() => {
                  if (journey.currentPosition) {
                    onDroneSelect(journey.registrationId, [journey.currentPosition.lng, journey.currentPosition.lat]);
                  }
                }}
                className={`relative cursor-pointer border-b border-black/5 px-5 py-4 transition-all duration-200 ${
                  isSelected
                    ? `border-l-4 border-l-[${droneColor}] bg-[rgb(37,37,38)]`
                    : 'border-l-4 border-l-transparent bg-transparent'
                }`}
              >
                <div className="mb-2 flex items-center">
                  <div className="mr-2 h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: droneColor }} />
                  <h3 className="m-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-white">
                    {journey.currentPosition?.name}
                  </h3>
                  <Navigation size={14} className="ml-2 flex-shrink-0 text-white" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col">
                    <span className="text-white">Serial #</span>
                    <span className="font-medium text-[#fbfbfe]">{journey.serial}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white">Registration #</span>
                    <span className="font-medium text-[#fbfbfe]">{journey.registrationId}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white">Pilot</span>
                    <span className="font-medium text-[#fbfbfe]">{journey.pilot}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white">Organization</span>
                    <span className="font-medium text-[#fbfbfe]">{journey.organization}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
