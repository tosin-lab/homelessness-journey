import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Journey from "./pages/Journey";
import Cases from "./pages/Cases";
import CaseWalk from "./pages/CaseWalk";
import Tools from "./pages/Tools";
import DutyFinder from "./pages/DutyFinder";
import NoticeChecker from "./pages/NoticeChecker";
import Affordability from "./pages/Affordability";
import Deadlines from "./pages/Deadlines";
import Learn from "./pages/Learn";
import FinalTest from "./pages/FinalTest";
import Flashcards from "./pages/Flashcards";
import Resources from "./pages/Resources";
import Handout from "./pages/Handout";
import Present from "./pages/Present";
import SearchPage from "./pages/SearchPage";
import NotFound from "./pages/NotFound";

const TITLES: [RegExp, string][] = [
  [/^\/journey/, "Journey"],
  [/^\/cases/, "Case walkthroughs"],
  [/^\/tools\/duty-finder/, "Which duty applies?"],
  [/^\/tools\/notice-checker/, "Notice checker"],
  [/^\/tools\/affordability/, "Affordability calculator"],
  [/^\/tools\/deadlines/, "Deadline calculator"],
  [/^\/tools/, "Tools"],
  [/^\/learn\/test/, "Knowledge test"],
  [/^\/learn\/flashcards/, "Interview flashcards"],
  [/^\/learn/, "Learn"],
  [/^\/resources/, "Resources"],
  [/^\/handout/, "Printable handout"],
  [/^\/search/, "Search"],
  [/^\/present/, "Trainer mode"]
];

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    const t = TITLES.find(([re]) => re.test(pathname))?.[1];
    document.title = t ? `${t} | Homelessness Journey` : "Homelessness Journey: Housing Officer Guide";
  }, [pathname]);

  return (
    <Routes>
      <Route path="/present" element={<Present />} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="journey" element={<Journey />} />
        <Route path="journey/:stageId" element={<Journey />} />
        <Route path="cases" element={<Cases />} />
        <Route path="cases/:caseId" element={<CaseWalk />} />
        <Route path="tools" element={<Tools />} />
        <Route path="tools/duty-finder" element={<DutyFinder />} />
        <Route path="tools/notice-checker" element={<NoticeChecker />} />
        <Route path="tools/affordability" element={<Affordability />} />
        <Route path="tools/deadlines" element={<Deadlines />} />
        <Route path="learn" element={<Learn />} />
        <Route path="learn/test" element={<FinalTest />} />
        <Route path="learn/flashcards" element={<Flashcards />} />
        <Route path="resources" element={<Resources />} />
        <Route path="handout" element={<Handout />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
