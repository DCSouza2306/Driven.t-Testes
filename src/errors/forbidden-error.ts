import { ApplicationError } from "@/protocols"

export default function forbiddenError(): ApplicationError{
    return {
        name: "ForbidenError",
        message: "Cannot access this page"
    }
}