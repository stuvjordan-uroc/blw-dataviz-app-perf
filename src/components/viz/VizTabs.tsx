import "./VizTabs.css";
import * as Tabs from "@radix-ui/react-tabs";

export default function VizTabs() {
  return (
    <Tabs.Root className="viztabs-root">
      <Tabs.List className="viztabs-tablist">
        <Tabs.Trigger className="viztabs-trigger" value="imp">
          Importance
        </Tabs.Trigger>
        <Tabs.Trigger className="viztabs-trigger" value="perf">
          Performance
        </Tabs.Trigger>
        <Tabs.Trigger className="viztabs-trigger" value="brightlines">
          Bright Lines
        </Tabs.Trigger>
        <button className="viztabs-fullscreen-button" type="button">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 2.5C2 2.22386 2.22386 2 2.5 2H5.5C5.77614 2 6 2.22386 6 2.5C6 2.77614 5.77614 3 5.5 3H3V5.5C3 5.77614 2.77614 6 2.5 6C2.22386 6 2 5.77614 2 5.5V2.5ZM9 2.5C9 2.22386 9.22386 2 9.5 2H12.5C12.7761 2 13 2.22386 13 2.5V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3H9.5C9.22386 3 9 2.77614 9 2.5ZM2.5 9C2.77614 9 3 9.22386 3 9.5V12H5.5C5.77614 12 6 12.2239 6 12.5C6 12.7761 5.77614 13 5.5 13H2.5C2.22386 13 2 12.7761 2 12.5V9.5C2 9.22386 2.22386 9 2.5 9ZM12.5 9C12.7761 9 13 9.22386 13 9.5V12.5C13 12.7761 12.7761 13 12.5 13H9.5C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12H12V9.5C12 9.22386 12.2239 9 12.5 9Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </Tabs.List>
      <Tabs.Content className="viztabs-content" value="imp"></Tabs.Content>
      <Tabs.Content className="viztabs-content" value="perf"></Tabs.Content>
      <Tabs.Content
        className="viztabs-content"
        value="brightlines"
      ></Tabs.Content>
    </Tabs.Root>
  );
}
