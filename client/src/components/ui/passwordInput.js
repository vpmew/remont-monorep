import { useState } from "react";
import {
  FormControl,
  OutlinedInput,
  InputLabel,
  InputAdornment,
  IconButton,
} from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";

function PasswordInput({
  label,
  labelWidth,
  value,
  onChange,
  onBlur = (x) => x,
  className,
}) {
  const [showPassword, toggle] = useState(false);

  const handleClickShowPassword = () => {
    toggle(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  return (
    <FormControl className={className} variant="outlined" size="small">
      <InputLabel htmlFor="outlined-adornment-password">{label}</InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        }
        labelWidth={labelWidth}
      />
    </FormControl>
  );
}

export default PasswordInput;
