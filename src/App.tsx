import { StoreProvider, useStore } from './store'
import { Shell } from './components/Shell'
import { Confetti, Helper } from './components/Mascot'
import { Login } from './screens/Login'
import { Home } from './screens/Home'
import { Upload } from './screens/Upload'
import { Results } from './screens/Results'
import { Practice, QuizScreen } from './screens/Practice'
import { Progress } from './screens/Progress'
import { Achievements } from './screens/Achievements'
import { Notifications } from './screens/Notifications'
import { Settings } from './screens/Settings'
import { TeacherApp } from './teacher/TeacherApp'

function Screens() {
  const { route, user } = useStore()
  if (!user) return <Login />
  if (user.role === 'teacher') return <TeacherApp />
  const screen = {
    home: <Home />,
    upload: <Upload />,
    results: <Results />,
    progress: <Progress />,
    practice: <Practice />,
    quiz: <QuizScreen />,
    achievements: <Achievements />,
    notifications: <Notifications />,
    settings: <Settings />,
  }[route.name]
  return (
    <Shell>
      <div key={route.name} className="animate-rise">
        {screen}
      </div>
      <Helper />
    </Shell>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Screens />
      <Confetti />
    </StoreProvider>
  )
}
