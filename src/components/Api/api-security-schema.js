import { Text } from "@mantine/core"

const ApiSecurityScheme = ({ scheme }) => {

    return (
        <div className="api-security-scheme">
            <Text>Security Schema Name: {scheme[0].name}</Text>
            <Text>Security Schema Type: {scheme[0].type}</Text>
        </div>
    )
}

export default ApiSecurityScheme