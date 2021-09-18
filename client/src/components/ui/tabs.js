import { useState } from "react";
import { Tabs, Tab, makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  tabs: {
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
  },
});

function SimpleTabs({ tabsAriaLabel, tabs = [], callback }) {
  const [value, setValue] = useState(0);
  const classes = useStyles();

  const handleChange = (event, newValue) => {
    if (value === newValue) return;
    setValue(newValue);
    callback(newValue);
  };

  return (
    <>
      <Tabs
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        className={classes.tabs}
        value={value}
        onChange={handleChange}
        aria-label={tabsAriaLabel}
      >
        {tabs.map((tab, i) => {
          return (
            <Tab disabled={value === i} key={tab.label} label={tab.label} />
          );
        })}
      </Tabs>
    </>
  );
}

export default SimpleTabs;
