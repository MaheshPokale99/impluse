"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";

/** A password field with a show/hide toggle. */
export function PasswordInput(props: Omit<ComponentProps<typeof InputGroupInput>, "type">) {
    const [visible, setVisible] = useState(false);
    return (
        <InputGroup>
            <InputGroupInput {...props} type={visible ? "text" : "password"} />
            <InputGroupAddon align="inline-end">
                <InputGroupButton
                    size="icon-xs"
                    aria-label={visible ? "Hide password" : "Show password"}
                    aria-pressed={visible}
                    onClick={() => setVisible((current) => !current)}
                >
                    {visible ? <EyeOff /> : <Eye />}
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    );
}
