import { useApp } from '../../src/store';
import { Screen } from '../../src/ui';
import Browse from '../../src/screens/Browse';
import HerRequests from '../../src/screens/HerRequests';
import WaliInbox from '../../src/screens/WaliInbox';

/** One tab, three faces — whichever role the viewer is in. */
export default function Home() {
  const { actor } = useApp();
  return (
    <Screen>
      {actor.role === 'man' ? <Browse /> : actor.role === 'woman' ? <HerRequests /> : <WaliInbox />}
    </Screen>
  );
}
