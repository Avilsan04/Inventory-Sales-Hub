import { BrowserRouter, Routes, Route } from 'react-router-dom';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Inventory Sales Hub</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
