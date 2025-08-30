import "./Controls.css";

interface State {
  state: boolean;
  setter: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Controls({
  waveState,
  partyState,
}: {
  waveState: State;
  partyState: State;
}) {
  return (
    <form>
      <label>
        split by wave
        <input
          type="checkbox"
          checked={waveState.state}
          onChange={(e) => {
            waveState.setter(e.target.checked);
          }}
        />
      </label>
      <label>
        split by party
        <input
          type="checkbox"
          checked={partyState.state}
          onChange={(e) => {
            partyState.setter(e.target.checked);
          }}
        />
      </label>
    </form>
  );
}
