import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import UploadPanel from './components/UploadPanel';
import CenterPanel from './components/CenterPanel';
import ResultsPanel from './components/ResultsPanel';
import PrintablePlan from './components/PrintablePlan';
import LandingPage from './components/LandingPage';
import { getSurveys, runSurvey, detectSingleImage, computeRoute } from './api';
import { AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'dashboard'
  const [surveys, setSurveys] = useState([
    { id: 'survey1', name: 'Survey 1', frames: 8 },
    { id: 'survey2', name: 'Survey 2', frames: 8 },
    { id: 'survey3', name: 'Survey 3', frames: 6 },
  ]);
  const [activeSurvey, setActiveSurvey] = useState('survey1');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [conf, setConf] = useState(0.40);
  const [correct, setCorrect] = useState(true);

  const [surveyData, setSurveyData] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('detect'); // 'detect' | 'route'
  const [compareBlindSearch, setCompareBlindSearch] = useState(true);

  const [hoveredPinId, setHoveredPinId] = useState(null);
  const [selectedPinId, setSelectedPinId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load surveys list on mount and automatically run Survey 1
  useEffect(() => {
    async function init() {
      try {
        const { data, isFallback } = await getSurveys();
        if (data && data.length > 0) {
          setSurveys(data);
        }
        if (isFallback) setIsOffline(true);
      } catch (err) {
        console.warn('Initial surveys fetch error:', err);
      }

      // Auto load initial Survey 1
      handleRunDetection('survey1', 0.40, true);
    }
    init();
  }, []);

  const handleRunDetection = async (surveyIdToRun = null, customConf = null, customCorrect = null) => {
    const sId = surveyIdToRun || activeSurvey;
    const c = customConf !== null ? customConf : conf;
    const cor = customCorrect !== null ? customCorrect : correct;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (uploadedFile) {
        // Single file detect
        const { data, isFallback } = await detectSingleImage(uploadedFile, c, cor);
        if (isFallback) setIsOffline(true);
        setSurveyData(data);
        setCurrentFrameIdx(0);

        if (data.pins && data.pins.length > 0) {
          const routeRes = await computeRoute(data.start || { x: 40, y: 40 }, data.pins);
          setRouteData(routeRes.data);
        } else {
          setRouteData({
            order: [],
            path: [],
            naive_path: [],
            naive_length_m: 3030.6,
            optimized_length_m: 0,
            saved_pct: 0,
            algorithm: 'none',
          });
        }
      } else if (sId) {
        // Run pre-packaged survey
        const { data, isFallback } = await runSurvey(sId, c, cor);
        if (isFallback) setIsOffline(true);
        setSurveyData(data);
        setCurrentFrameIdx(0);

        if (data.pins && data.pins.length > 0) {
          const routeRes = await computeRoute(data.start || { x: 40, y: 40 }, data.pins, sId);
          setRouteData(routeRes.data);
        } else {
          setRouteData({
            order: [],
            path: [],
            naive_path: [],
            naive_length_m: 3030.6,
            optimized_length_m: 0,
            saved_pct: 0,
            algorithm: 'none',
          });
        }
      }
    } catch (err) {
      console.error('Detection failed:', err);
      setErrorMessage(`Detection error: ${err.message || 'Unable to process frames'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanRoute = async () => {
    if (!surveyData?.pins || surveyData.pins.length === 0) return;
    setIsRouting(true);
    setErrorMessage(null);

    try {
      const { data, isFallback } = await computeRoute(
        surveyData.start || { x: 40, y: 40 },
        surveyData.pins,
        activeSurvey
      );
      if (isFallback) setIsOffline(true);
      setRouteData(data);
      setActiveTab('route'); // Switch to route view to showcase the plan
    } catch (err) {
      console.error('Route calculation failed:', err);
      setErrorMessage(`Routing error: ${err.message}`);
    } finally {
      setIsRouting(false);
    }
  };

  const handleJumpToFrame = (frameIdx) => {
    setCurrentFrameIdx(frameIdx);
    setActiveTab('detect');
  };

  return (
    <div className="w-screen h-screen flex flex-col font-sans text-xs bg-[#070B14] text-[#E2E8F0] overflow-hidden select-none">
      {view === 'landing' ? (
        <LandingPage setView={setView} />
      ) : (
        <>
          {/* Top Bar (56px) */}
          <TopBar view={view} setView={setView} isOffline={isOffline} />

          {/* Dismissible Error Banner */}
          {errorMessage && (
            <div className="bg-red-950/80 border-b border-red-500/40 px-4 py-2 flex items-center justify-between text-xs text-red-200 z-30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="p-1 hover:bg-red-900 rounded text-red-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 3-Column Cockpit (Remaining full height, no outer scroll) */}
          <main className="flex-1 flex w-full overflow-hidden p-3 gap-3">
            {/* Left: 1 • Upload (23%) */}
            <UploadPanel
              surveys={surveys}
              activeSurvey={activeSurvey}
              setActiveSurvey={(id) => {
                setActiveSurvey(id);
                handleRunDetection(id);
              }}
              uploadedFile={uploadedFile}
              setUploadedFile={(f) => {
                setUploadedFile(f);
              }}
              conf={conf}
              setConf={setConf}
              correct={correct}
              setCorrect={setCorrect}
              isLoading={isLoading}
              onRunDetection={() => handleRunDetection()}
            />

            {/* Center: 2 • Detect & 3 • Route (49%) */}
            <CenterPanel
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              surveyData={surveyData}
              routeData={routeData}
              currentFrameIdx={currentFrameIdx}
              setCurrentFrameIdx={setCurrentFrameIdx}
              compareBlindSearch={compareBlindSearch}
              setCompareBlindSearch={setCompareBlindSearch}
              isLoading={isLoading}
              hoveredPinId={hoveredPinId}
              setHoveredPinId={setHoveredPinId}
              selectedPinId={selectedPinId}
              setSelectedPinId={setSelectedPinId}
              onSelectSample={(id) => {
                setActiveSurvey(id);
                setUploadedFile(null);
                handleRunDetection(id);
              }}
            />

            {/* Right: 3 • Results (28%) */}
            <ResultsPanel
              surveyData={surveyData}
              routeData={routeData}
              hoveredPinId={hoveredPinId}
              setHoveredPinId={setHoveredPinId}
              selectedPinId={selectedPinId}
              setSelectedPinId={setSelectedPinId}
              onPlanRoute={handlePlanRoute}
              isRouting={isRouting}
              onJumpToFrame={handleJumpToFrame}
            />
          </main>

          {/* Printable Dive Plan (Hidden on screen, visible during window.print()) */}
          <PrintablePlan surveyData={surveyData} routeData={routeData} />
        </>
      )}
    </div>
  );
}
