import { useEffect, useState, type JSX } from 'react';
import io from 'socket.io-client';

interface DroneData {
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

export function DroneSidebar(): JSX.Element {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [allDronesData, setAllDronesData] = useState<Map<string, any>>(new Map());
  const [activeTab, setActiveTab] = useState<'drones' | 'history'>('drones');

  useEffect(() => {
    const socket = io('http://localhost:9013', {
      transports: ['polling'],
    });

    socket.on('connect', () => {
      setConnectionStatus('Connected');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('Disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('DroneSidebar: Connection error:', error);
      setConnectionStatus('Error');
    });

    // Listen for individual drone updates via WebSocket
    socket.on('message', (data: DroneData) => {
      if (data.features && data.features.length > 0) {
        // Process each drone feature and add/update in the collection
        setAllDronesData((prev) => {
          const newDronesMap = new Map(prev);

          data.features.forEach((droneFeature) => {
            const serial = droneFeature.properties.serial;
            // Add timestamp to track when we last received data for this drone
            const droneWithTimestamp = {
              ...droneFeature,
              lastUpdated: Date.now(),
            };
            newDronesMap.set(serial, droneWithTimestamp);
          });

          return newDronesMap;
        });
      }
    });

    // Clean up old drone data (remove drones not updated in 30 seconds)
    const cleanupInterval = setInterval(() => {
      const thirtySecondsAgo = Date.now() - 30000;

      setAllDronesData((prev) => {
        const updatedMap = new Map();

        prev.forEach((drone, serial) => {
          if (drone.lastUpdated > thirtySecondsAgo) {
            updatedMap.set(serial, drone);
          }
        });

        return updatedMap;
      });
    }, 10000); // Run cleanup every 10 seconds

    return () => {
      clearInterval(cleanupInterval);
      socket.close();
    };
  }, []);

  const getAllDrones = () => {
    return Array.from(allDronesData.values());
  };

  const getDronesInSky = () => {
    const allDrones = getAllDrones();

    return allDrones.filter((drone) => {
      // Filter based on altitude (assuming drones with altitude > 0 are in the sky)
      return drone.properties.altitude > 0;
    });
  };

  const getDronesByStatus = () => {
    const allDrones = getAllDrones();
    const inSky = getDronesInSky();
    const onGround = allDrones.filter((drone) => drone.properties.altitude === 0);

    return {
      inSky,
      onGround,
      total: allDrones.length,
    };
  };

  const { inSky, onGround, total } = getDronesByStatus();

  return (
    <div className="z-[1] flex h-screen w-80 flex-col border-r border-gray-700 bg-black/90 text-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-700 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">DRONE FLYING</h2>
          {/* Connection Status Indicator */}
          <div className="flex items-center space-x-2">
            <div
              className={`h-2 w-2 rounded-full ${
                connectionStatus === 'Connected'
                  ? 'bg-green-500'
                  : connectionStatus === 'Disconnected'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
            ></div>
            <span className="text-xs text-gray-400">{connectionStatus}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('drones')}
            className={`border-b-2 pb-2 text-sm transition-colors ${
              activeTab === 'drones' ? 'border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Drones ({inSky.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`border-b-2 pb-2 text-sm transition-colors ${
              activeTab === 'history'
                ? 'border-red-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Flights History
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'drones' && (
          <div className="space-y-0">
            {connectionStatus === 'Connected' ? (
              inSky.length > 0 ? (
                inSky.map((drone, index) => (
                  <div
                    key={drone.properties.serial}
                    className="cursor-pointer border-b border-gray-700/50 p-4 transition-colors hover:bg-gray-800/50"
                  >
                    {/* Drone Name and Status */}
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium text-white">{drone.properties.Name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">{drone.properties.altitude}m</span>
                        <div
                          className={`h-3 w-3 rounded-full ${
                            drone.properties.registration.split('-')[1]?.startsWith('B') ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        ></div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div>
                        <span className="text-gray-400">Serial #</span>
                        <div className="text-gray-300">{drone.properties.serial}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Registration #</span>
                        <div className="text-gray-300">{drone.properties.registration}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Pilot</span>
                        <div className="text-gray-300">{drone.properties.pilot}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Organization</span>
                        <div className="text-gray-300">{drone.properties.organization}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400">
                  <p>No drones currently in the sky</p>
                </div>
              )
            ) : (
              <div className="p-4 text-center text-gray-400">
                {connectionStatus === 'Disconnected'
                  ? 'Connecting to drone server...'
                  : connectionStatus === 'Error'
                    ? 'Failed to connect to drone server'
                    : 'Establishing connection...'}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-4 text-center text-gray-400">
            <p>Flight history feature coming soon...</p>
            {allDronesData && (
              <div className="mt-4 text-left">
                <p className="text-sm">Total drones tracked: {total}</p>
                <p className="text-sm">Currently in sky: {inSky.length}</p>
                <p className="text-sm">On ground: {onGround.length}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
