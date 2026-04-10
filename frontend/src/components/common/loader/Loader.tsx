import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog"
import useLoaderState from "@/store/LoaderStateStore"
import { Spinner } from "@/components/ui/spinner"

const Loader = () => {
  const isOpen = useLoaderState((state) => state.isOpen)
  const setIsOpen = useLoaderState((state) => state.setIsOpen)
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <div className="flex items-center justify-center gap-5">
          <p className="text-md font-semibold">Loading</p>
          <Spinner className="size-6" />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default Loader
