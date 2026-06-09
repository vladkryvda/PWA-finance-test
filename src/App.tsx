/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { AddPage } from './pages/Add';
import { InsightsPage } from './pages/Insights';
import { SettingsModal } from './components/SettingsModal';
import { useAppStore } from './store/store';

export default function App() {
  const activeTab = useAppStore(state => state.activeTab);

  return (
    <>
      <Layout>
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'add' && <AddPage />}
        {activeTab === 'insights' && <InsightsPage />}
      </Layout>
      <SettingsModal />
    </>
  );
}
