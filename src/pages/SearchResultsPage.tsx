/*
SEARCH DETAIL SCREEN SPECIFICATIONS

- The Search Detail Screen does NOT use a traditional carousel, but visually resembles one.
- Each Business Detail is a Pane within this page (not a separate page). Artists/Vendors will eventually have their own dedicated, larger, scrollable pages linked from these fake carousel panes.
- The "fake carousel" works as follows:
  - Uses animation to allow the user to control how the panes change (left/right in a loop, or vertical scrolling with cards moving upward and looping).
  - User controls the speed of the animation.
  - Animation starts slow, then "snaps" or "pops" into place at the end (magnet effect).
  - User can disable animation and use manual controls to move between panes (left/right/up/down). Manual navigation can be via L/R Up/Down icons to click (or swiping in any direction on mobile), and the behavior is exactly like the animated version: the new pane has magnetic snap-to-place when it appears.
  - Left and up go to the same image; right and down go to the same image (just different animation direction).
- Panes fill the entire window (left to right, top to bottom), except for the small header and the mini category cards at the bottom.
- Clicking a mini category card at the bottom opens the detail view for that category, showing only the businesses saved in that category as panes in this fake carousel.
- The cards and panes are persistent per event (Supabase data stored).
- This design is intended to be visually engaging, highly interactive, and modular for future expansion (e.g., dedicated artist/vendor pages, advanced chat, quote requests, etc.).
*/

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BusinessCloudCanvas } from '../components/BusinessCloudCanvas'
import { useCloudStore } from '../store/cloudStore'
import { MainHeader } from '../components/headers/MainHeader'
import { SearchMenuTemplate } from '../components/menus/SearchMenuTemplate'

export function SearchResultsPage() {
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [isMenuVisible, setIsMenuVisible] = useState(false)
  const navigate = useNavigate()
  const {
    searchResults,
    selectedBusiness,
    config,
    isAnimating,
    animationSpeed,
    toggleAnimation,
    setAnimationSpeed,
    updateConfig,
    resetSearch
  } = useCloudStore()

  const handleOpenMenu = () => {
    setIsMenuVisible(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex flex-col">
      {/* Header */}
      <MainHeader onMenuClick={handleOpenMenu} />

      {/* Main Content */}
      <main className="flex-1 flex">
        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <BusinessCloudCanvas 
              width={canvasSize.width} 
              height={canvasSize.height} 
            />
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-80 bg-white/10 backdrop-blur-sm border-l border-white/20 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Controls</h2>
          
          {/* Animation Controls */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Animation</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Animation</span>
                <button
                  onClick={toggleAnimation}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isAnimating 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isAnimating ? 'Stop' : 'Start'}
                </button>
              </div>
              
              <div>
                <label className="block text-sm text-white mb-2">Speed</label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-white">{animationSpeed.toFixed(1)}x</span>
              </div>
            </div>
          </div>

          {/* Physics Controls */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Physics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Clustering</span>
                <input
                  type="checkbox"
                  checked={config.clusteringEnabled}
                  onChange={(e) => updateConfig({ clusteringEnabled: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>
              
              <div>
                <label className="block text-sm text-white mb-2">Damping</label>
                <input
                  type="range"
                  min="0.8"
                  max="1"
                  step="0.01"
                  value={config.damping}
                  onChange={(e) => updateConfig({ damping: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm text-white">{config.damping.toFixed(2)}</span>
              </div>
              
              <div>
                <label className="block text-sm text-white mb-2">Repulsion Force</label>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={config.repulsionForce}
                  onChange={(e) => updateConfig({ repulsionForce: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm text-white">{config.repulsionForce}</span>
              </div>
              
              <div>
                <label className="block text-sm text-white mb-2">Attraction Force</label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={config.attractionForce}
                  onChange={(e) => updateConfig({ attractionForce: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-sm text-white">{config.attractionForce}</span>
              </div>
            </div>
          </div>

          {/* Canvas Size Controls */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Canvas Size</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white mb-2">Width</label>
                <input
                  type="range"
                  min="400"
                  max="1200"
                  step="50"
                  value={canvasSize.width}
                  onChange={(e) => setCanvasSize(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-sm text-white">{canvasSize.width}px</span>
              </div>
              
              <div>
                <label className="block text-sm text-white mb-2">Height</label>
                <input
                  type="range"
                  min="300"
                  max="800"
                  step="50"
                  value={canvasSize.height}
                  onChange={(e) => setCanvasSize(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-sm text-white">{canvasSize.height}px</span>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Results</h3>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-white mb-2">
                <span className="font-semibold">{searchResults.length}</span> businesses found
              </p>
              {selectedBusiness && (
                <div className="mt-4 p-3 bg-white/20 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">{selectedBusiness.name}</h4>
                  <p className="text-sm text-purple-100 mb-1">{selectedBusiness.category}</p>
                  <p className="text-sm text-purple-100">Rating: {selectedBusiness.rating}/5</p>
                  <p className="text-sm text-purple-100">Price: ${selectedBusiness.price}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={resetSearch}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Reset Search
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              New Search
            </button>
          </div>
        </div>
      </main>

      {/* SearchMenuTemplate */}
      <SearchMenuTemplate
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        onApplyFilters={(filters) => {
          console.log('Applied filters:', filters)
          // TODO: Implement filter application logic
        }}
      />
    </div>
  )
} 