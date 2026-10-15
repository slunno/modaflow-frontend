import { Outlet, useOutletContext } from 'react-router-dom';
import '../../components/layout/workspace.css';

/** Os estilos da área compartilhada não devem reformular as páginas anteriores. */
export default function WorkspaceShell() {
  const context = useOutletContext();
  return (
    <div className="akr-app">
      <Outlet context={context} />
    </div>
  );
}
