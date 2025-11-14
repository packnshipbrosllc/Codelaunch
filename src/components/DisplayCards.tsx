'use client';

export function DisplayCards() {
  return (
    <div className="relative py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          {/* Display Cards */}
          <div className="relative flex items-center justify-center min-h-[500px]">
            <div className="relative w-full max-w-md">
              {/* Card 3 - Bottom (Most transparent) */}
              <div
                className="absolute top-[160px] left-[128px] w-80 h-36 transform skew-y-[-8deg] 
                         bg-gray-900/40 backdrop-blur-sm
                         border-2 border-gray-700/40 rounded-xl p-4
                         transition-all duration-700 ease-out
                         hover:translate-y-[-40px] hover:bg-gray-900/90 hover:backdrop-blur-xl hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20
                         cursor-pointer group z-10"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-lg">
                      ⚡
                    </div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Full-Stack Code
                    </h3>
                  </div>
                  <p className="text-sm text-gray-300 leading-tight mb-2">
                    Production-ready code you can deploy or feed into Claude/Cursor
                  </p>
                  <p className="text-xs text-gray-500">Step 3 • 1-2 weeks</p>
                </div>
                {/* Shadow overlay on right */}
                <div className="absolute right-[-4px] top-[-5%] h-[110%] w-64 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none" />
              </div>

              {/* Card 2 - Middle (Semi-transparent) */}
              <div
                className="absolute top-[80px] left-[64px] w-80 h-36 transform skew-y-[-8deg]
                         bg-gray-900/60 backdrop-blur-md
                         border-2 border-gray-700/60 rounded-xl p-4
                         transition-all duration-700 ease-out
                         hover:translate-y-[-40px] hover:bg-gray-900/95 hover:backdrop-blur-xl hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20
                         cursor-pointer group z-20"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-lg">
                      📋
                    </div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      PRD Generation
                    </h3>
                  </div>
                  <p className="text-sm text-gray-300 leading-tight mb-2">
                    10,000+ line PRDs with database schemas, API specs & user stories
                  </p>
                  <p className="text-xs text-gray-500">Step 2 • 3-5 days</p>
                </div>
                {/* Shadow overlay on right */}
                <div className="absolute right-[-4px] top-[-5%] h-[110%] w-64 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none" />
              </div>

              {/* Card 1 - Top (Fully visible) */}
              <div
                className="relative top-0 left-0 w-80 h-36 transform skew-y-[-8deg]
                         bg-gray-900/90 backdrop-blur-xl
                         border-2 border-gray-700 rounded-xl p-4
                         transition-all duration-700 ease-out
                         hover:translate-y-[-40px] hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20
                         cursor-pointer group z-30"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-lg">
                      🧠
                    </div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      AI Mindmap
                    </h3>
                  </div>
                  <p className="text-sm text-gray-300 leading-tight mb-2">
                    Transform ideas into detailed mindmaps with features, competitors & personas
                  </p>
                  <p className="text-xs text-gray-500">Step 1 • 1-2 days</p>
                </div>
                {/* Shadow overlay on right */}
                <div className="absolute right-[-4px] top-[-5%] h-[110%] w-64 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
