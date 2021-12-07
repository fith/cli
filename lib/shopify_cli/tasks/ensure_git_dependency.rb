require "shopify_cli"

module ShopifyCLI
  module Tasks
    class EnsureGitDependency < ShopifyCLI::Task
      def call(ctx)
        return if ShopifyCLI::Environment.acceptance_test?
        unless ShopifyCLI::Git.available?(ctx)
          raise ShopifyCLI::Abort, ctx.message("core.git.nonexistent")
        end
      end
    end
  end
end
