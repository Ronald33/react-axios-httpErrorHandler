let _triggerFn = null

const HttpErrorHandler = () => null

HttpErrorHandler.registerApi = (axiosInstance) =>
{
    const validateStatus = axiosInstance.defaults.validateStatus

    const handle = (config, errorObj) =>
    {
        const disabled = config?._disableErrorHandler
        if(!disabled && _triggerFn) { _triggerFn(errorObj) }
    }

    axiosInstance.interceptors.response.use(
        (response) =>
        {
            if(validateStatus?.(response.status)) { handle(response.config, response) }
            return response
        },
        (error) =>
        {
            if(!validateStatus?.(error.response?.status)) { handle(error.config, error) }
            return Promise.reject(error)
        }
    )
}

HttpErrorHandler.setTrigger = (fn) =>
{
    _triggerFn = fn
}

export default HttpErrorHandler