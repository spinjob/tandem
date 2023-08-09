// LanguageDropdown.js

import React from "react";
import { Select } from "@mantine/core";
import { languageOptions } from './constants/languageOptions';

const LanguagesDropdown = ({ onSelectChange }) => {
  return (
    <Select
      placeholder={`Filter By Category`}
      data={languageOptions}
      defaultValue={languageOptions[0]}
      onChange={(selectedOption) => onSelectChange(selectedOption)}
    />
  );
};

export default LanguagesDropdown;