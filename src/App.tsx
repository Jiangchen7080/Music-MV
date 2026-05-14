import { StepIndicator } from './components/steps/step-indicator'
import { useProjectStore } from './stores/project-store'
import { UploadPage } from './components/upload/upload-page'
import { ConfigPage } from './components/config/config-page'
import { GeneratePage } from './components/generate/generate-page'
import { EditPage } from './components/timeline/edit-page'
import { OutputPage } from './components/output/output-page'

function App() {
  const currentStep = useProjectStore((s) => s.currentStep)

  const renderStep = () => {
    switch (currentStep) {
      case 'upload': return <UploadPage />
      case 'config': return <ConfigPage />
      case 'generate': return <GeneratePage />
      case 'edit': return <EditPage />
      case 'output': return <OutputPage />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-surface-800">
        <div className="flex items-center justify-between px-6 py-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">
            AI-MV Studio
          </h1>
        </div>
        <StepIndicator />
      </header>
      <main className="flex-1 p-6">
        {renderStep()}
      </main>
    </div>
  )
}

export default App