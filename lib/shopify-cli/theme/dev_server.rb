# frozen_string_literal: true
require_relative "dev_server/config"
require_relative "dev_server/hot_reload"
require_relative "dev_server/ignore_filter"
require_relative "dev_server/header_hash"
require_relative "dev_server/local_assets"
require_relative "dev_server/mime_type"
require_relative "dev_server/proxy"
require_relative "dev_server/sse"
require_relative "dev_server/theme"
require_relative "dev_server/uploader"
require_relative "dev_server/watcher"
require_relative "dev_server/web_server"
require_relative "dev_server/certificate_manager"

require "pathname"

module ShopifyCli
  module Theme
    module DevServer
      class << self
        attr_accessor :ctx

        def start(ctx, root, silent: false, port: 9292, env: "development")
          @ctx = ctx
          config = Config.from_path(root, environment: env)
          theme = Theme.new(ctx, config)
          @uploader = Uploader.new(ctx, theme)
          watcher = Watcher.new(ctx, theme, @uploader)

          # Setup the middleware stack. Mimics Rack::Builder / config.ru, but in reverse order
          @app = Proxy.new(ctx, theme)
          @app = LocalAssets.new(ctx, @app, theme)
          @app = HotReload.new(ctx, @app, theme, watcher)
          stopped = false

          trap("INT") do
            stopped = true
            stop
          end

          puts "Syncing theme ##{config.theme_id} on #{theme.shop}" unless silent
          @uploader.start_threads
          if silent
            @uploader.upload_theme!
          else
            CLI::UI::Progress.progress do |bar|
              @uploader.upload_theme! do |left, total|
                bar.tick(set_percent: 1 - left.to_f / total)
              end
              bar.tick(set_percent: 1)
            end
          end

          return if stopped

          unless silent
            puts "Serving #{theme.root}"
            puts "Browse to http://127.0.0.1:#{port}"
            puts "(Use Ctrl-C to stop)"
          end

          logger = if ctx.debug?
            WEBrick::Log.new(nil, WEBrick::BasicLog::INFO)
          else
            WEBrick::Log.new(nil, WEBrick::BasicLog::FATAL)
          end

          watcher.start
          WebServer.run(
            @app,
            Port: port,
            Logger: logger,
            AccessLog: [],
          )
          watcher.stop

        rescue ShopifyCli::API::APIRequestForbiddenError,
               ShopifyCli::API::APIRequestUnauthorizedError
          @ctx.abort("You are not authorized to edit themes on #{theme.shop}.\n" \
                     "Make sure you are a user of that store, and allowed to edit themes.")
        end

        def stop
          @ctx.puts("Stopping ...")
          @app.close
          @uploader.shutdown
          WebServer.shutdown
        end
      end
    end
  end
end
