---
date: 2025-03-20
article: true
category:
  - tech
tag:
  - io_uring
---

# io_uring源码解析（逐Patch）
```
git log --grep="io_uring" --pretty=format:"%h - %s" --reverse --no-merges | \
awk '{lines[NR] = $0} END {for (i = NR; i > 0; i--) printf("## [%d] %s\n", i, lines[i]);}' | \
tee io_uring.commit.list
```

## [3508] d55011469b41 - fuse: fix possible deadlock if rings are never initialized
## [3507] 182db972c956 - mm: fix error handling in __filemap_get_folio() with FGP_NOWAIT
## [3506] bcb0fda3c2da - io_uring/rw: ensure reissue path is correctly handled for IOPOLL
## [3505] 00817f0f1c45 - nvme-ioctl: fix leaked requests on mapping error
## [3504] 6ebf05189dfc - io_uring/net: save msg_control for compat
## [3503] 4614de748e78 - io_uring/rw: clean up mshot forced sync mode
## [3502] 74f3e875268f - io_uring/rw: move ki_complete init into prep
## [3501] 4e43133c6f23 - io_uring/rw: don't directly use ki_complete
## [3500] 67b0025d19f9 - io_uring/rw: forbid multishot async reads
## [3499] fb3331f53e3c - io_uring/rsrc: remove unused constants
## [3498] 1fc61eeefe10 - io_uring: fix spelling error in uapi io_uring.h
## [3497] 1e988c3fe126 - io_uring: prevent opcode speculation
## [3496] 13918315c5dc - io-wq: backoff when retrying worker creation
## [3495] d6211ebbdaa5 - io_uring/uring_cmd: unconditionally copy SQEs at prep time
## [3494] 2b4fc4cd43f2 - io_uring/waitid: setup async data in the prep handler
## [3493] 0edf1283a9d1 - io_uring/uring_cmd: remove dead req_has_async_data() check
## [3492] e663da62ba86 - io_uring/uring_cmd: switch sqe to async_data on EAGAIN
## [3491] 34cae91215c6 - io_uring/uring_cmd: don't assume io_uring_cmd_data layout
## [3490] 8802766324e1 - io_uring/kbuf: reallocate buf lists on upgrade
## [3489] 06521ac0485e - io_uring/waitid: don't abuse io_tw_state
## [3488] 8c8492ca64e7 - io_uring/net: don't retry connect operation on EPOLLERR
## [3487] d1fdab8c0679 - io_uring/rw: simplify io_rw_recycle()
## [3486] 0d124578fed9 - io_uring: remove !KASAN guards from cache free
## [3485] 86e62354eef1 - io_uring/net: extract io_send_select_buffer()
## [3484] 2b350f756b7a - io_uring/net: clean io_msg_copy_hdr()
## [3483] fefcb0dcd02f - io_uring/net: make io_net_vec_assign() return void
## [3482] d19af0e93662 - io_uring: add alloc_cache.c
## [3481] 16ac51a0a7aa - io_uring: dont ifdef io_alloc_cache_kasan()
## [3480] 299276502d41 - io_uring: include all deps for alloc_cache.h
## [3479] d63b0e8a628e - io_uring: fix multishots with selected buffers
## [3478] 786412a73e7e - fuse: enable fuse-over-io-uring
## [3477] b6236c8407cb - fuse: {io-uring} Prevent mount point hang on fuse-server termination
## [3476] 857b0263f30e - fuse: Allow to queue bg requests through io-uring
## [3475] c2c9af9a0b13 - fuse: Allow to queue fg requests through io-uring
## [3474] 4a9bfb9b6850 - fuse: {io-uring} Handle teardown of ring entries
## [3473] c090c8abae4b - fuse: Add io-uring sqe commit and fetch support
## [3472] 9ad6344568cc - mm/filemap: change filemap_create_folio() to take a struct kiocb
## [3471] a23ad06bfee5 - io_uring/register: use atomic_read/write for sq_flags migration
## [3470] 24fe962c86f5 - fuse: {io-uring} Handle SQEs - register commands
## [3469] 5e0e02f0d7e5 - futex: Pass in task to futex_queue()
## [3468] ff74954e4e93 - io_uring/alloc_cache: get rid of _nocache() helper
## [3467] fa3595523d72 - io_uring: get rid of alloc cache init_once handling
## [3466] eaf72f7b414f - io_uring/uring_cmd: cleanup struct io_uring_cmd_data layout
## [3465] d58d82bd0efd - io_uring/uring_cmd: use cached cmd_op in io_uring_cmd_sock()
## [3464] 69a62e03f896 - io_uring/msg_ring: don't leave potentially dangling ->tctx pointer
## [3463] 2839ab71ac90 - io_uring/rsrc: Move lockdep assert from io_free_rsrc_node() to caller
## [3462] b73de0da5012 - io_uring/rsrc: remove unused parameter ctx for io_rsrc_node_alloc()
## [3461] bb2d76344bc8 - io_uring: clean up io_uring_register_get_file()
## [3460] 5719e2823565 - io_uring/rsrc: Simplify buffer cloning by locking both rings
## [3459] 561e3a0c40dc - io_uring/fdinfo: fix io_uring_show_fdinfo() misuse of ->d_iname
## [3458] bab4b2cca027 - io_uring: reuse io_should_terminate_tw() for cmds
## [3457] 53745105efc3 - io_uring: Factor out a function to parse restrictions
## [3456] 6f7a644eb7db - io_uring/register: cache old SQ/CQ head reading for copies
## [3455] 2c5aae129f42 - io_uring/register: document io_register_resize_rings() shared mem usage
## [3454] 8911798d3e8a - io_uring/register: use stable SQ/CQ ring data during resize
## [3453] 19d340a2988d - io_uring/rsrc: require cloned buffers to share accounting contexts
## [3452] c1c03ee7957e - io_uring/rsrc: fixup io_clone_buffers() error handling
## [3451] a13030fd194c - io_uring: simplify the SQPOLL thread check when cancelling requests
## [3450] e32dcdb0af9f - btrfs: add io_uring interface for encoded writes
## [3449] 94d57442e56d - io_uring: expose read/write attribute capability
## [3448] bd2703b42dec - io_uring: don't touch sqd->thread off tw add
## [3447] 4b7cfa8b6c28 - io_uring/sqpoll: zero sqd->thread on tctx errors
## [3446] b08e02045002 - io_uring/rw: don't gate retry on completion context
## [3445] d803d123948f - io_uring/rw: handle -EAGAIN retry at IO completion time
## [3444] 9ac273ae3dc2 - io_uring/rw: use io_rw_recycle() from cleanup path
## [3443] 4e15fa8305de - io_uring_poll: kill the no longer necessary barrier after poll_wait()
## [3442] 93e505a300aa - tools: ynl-gen-c: improve support for empty nests
## [3441] c9a40292a44e - io_uring/eventfd: ensure io_eventfd_signal() defers another RCU period
## [3440] 60495b08cf7a - io_uring: silence false positive warnings
## [3439] c21b89d495ba - btrfs: don't read from userspace twice in btrfs_uring_encoded_read()
## [3438] b0af20d33f63 - io_uring: add io_uring_cmd_get_async_data helper
## [3437] 3347fa658a1b - io_uring/cmd: add per-op data to struct io_uring_cmd_data
## [3436] dadf03cfd4ea - io_uring/cmd: rename struct uring_cache to io_uring_cmd_data
## [3435] c83c846231db - io_uring/timeout: fix multishot updates
## [3434] 2a51c327d4a4 - io_uring/rsrc: simplify the bvec iter count calculation
## [3433] ed123c948d06 - io_uring/kbuf: use pre-committed buffer address for non-pollable file
## [3432] c6e60a0a68b7 - io_uring/net: always initialize kmsg->msg.msg_inq upfront
## [3431] d62c2f0d8275 - io_uring: ensure io_queue_deferred() is out-of-line
## [3430] a9c83a0ab66a - io_uring/timeout: flush timeouts outside of the timeout lock
## [3429] 38fc96a58ce4 - io_uring/rw: fix downgraded mshot read
## [3428] c5f719161460 - io_uring/rw: always clear ->bytes_done on io_async_rw setup
## [3427] 21adbcaa8007 - io_uring/rw: use NULL for rw->free_iovec assigment
## [3426] 1143be17d7ac - io_uring/rw: don't mask in f_iocb_flags
## [3425] ce9464081d51 - io_uring/msg_ring: Drop custom destructor
## [3424] ef623a647f42 - io_uring: Move old async data allocation helper to header
## [3423] d7f11616edf5 - io_uring/rw: Allocate async data through helper
## [3422] f49a85371d8c - io_uring/net: Allocate msghdr async data through helper
## [3421] e9447dc0b18d - io_uring/uring_cmd: Allocate async data through generic helper
## [3420] 1210872918ef - io_uring/poll: Allocate apoll with generic alloc_cache helper
## [3419] b28465670606 - io_uring/futex: Allocate ifd with generic alloc_cache helper
## [3418] 49f7a3098cc2 - io_uring: Add generic helper to allocate async data
## [3417] e33ac68e5e21 - io_uring/sqpoll: fix sqpoll error handling races
## [3416] 479b2f4590be - io_uring: Fold allocation into alloc_cache helper
## [3415] 29b95ac91792 - io_uring: prevent reg-wait speculations
## [3414] de3b9e2e4819 - io_uring: don't vmap single page regions
## [3413] 2e6406a20a39 - io_uring: clean up io_prep_rw_setup()
## [3412] febfbf767174 - io_uring/kbuf: fix unintentional sign extension on shift of reg.bgid
## [3411] 59a7d12a7fb5 - io_uring: introduce attributes for read/write and PI support
## [3410] 7cd7b9575270 - io_uring/memmap: unify io_uring mmap'ing code
## [3409] ef62de3c4ad5 - io_uring/kbuf: use region api for pbuf rings
## [3408] 90175f3f5032 - io_uring/kbuf: remove pbuf ring refcounting
## [3407] 78fda3d05641 - io_uring/kbuf: use mmap_lock to sync with mmap
## [3406] 81a4058e0cd0 - io_uring: use region api for CQ
## [3405] 8078486e1d53 - io_uring: use region api for SQ
## [3404] 02255d55260a - io_uring: pass ctx to io_register_free_rings
## [3403] 087f997870a9 - io_uring/memmap: implement mmap for regions
## [3402] 1e21df691ffa - io_uring/memmap: implement kernel allocated regions
## [3401] 4b851d20d325 - io_uring/memmap: add IO_REGION_F_SINGLE_REF
## [3400] a90558b36cce - io_uring/memmap: helper for pinning region pages
## [3399] c4d0ac1c1567 - io_uring/memmap: optimise single folio regions
## [3398] 226ae1b4d111 - io_uring/memmap: reuse io_free_region for failure path
## [3397] fc5f22a64649 - io_uring/memmap: account memory before pinning
## [3396] 16375af32d0f - io_uring/memmap: flag regions with user pages
## [3395] a730d2047d4e - io_uring/memmap: flag vmap'ed regions
## [3394] 7427b0b49ad5 - io_uring/rsrc: export io_check_coalesce_buffer
## [3393] 943d0609d057 - io_uring: rename ->resize_lock
## [3392] dbd2ca9367eb - io_uring: check if iowq is killed before queuing
## [3391] c261e4f1dd29 - io_uring/register: limit ring resizing to DEFER_TASKRUN
## [3390] 12d908116f7e - io_uring: Fix registered ring file refcount leak
## [3389] 020b40f35624 - io_uring: make ctx->timeout_lock a raw spinlock
## [3388] fcc680a647ba - page_pool: allow mixing PPs within one bulk
## [3387] 99d6af6e8a22 - io_uring/rsrc: don't put/free empty buffers
## [3386] a07d2d7930c7 - io_uring: Change res2 parameter type in io_uring_cmd_done
## [3385] b690668b65e5 - io_uring: avoid pointless cred reference count bump
## [3384] 22d2e48e3185 - btrfs: fix lockdep warnings on io_uring encoded reads
## [3383] e8b8344de398 - block, bfq: fix bfqq uaf in bfq_limit_depth()
## [3382] 7eb75ce75271 - io_uring/tctx: work around xa_store() allocation error issue
## [3381] 43eef70e7e2a - io_uring: fix corner case forgetting to vunmap
## [3380] 49c5c63d48eb - io_uring: fix task_work cap overshooting
## [3379] 0c0a4eae26ac - io_uring: check for overflows in io_pin_pages
## [3378] ee116574de84 - io_uring/nop: ensure nop->fd is always initialized
## [3377] f46b9cdb22f7 - io_uring: limit local tw done
## [3376] 40cfe553240b - io_uring: add io_local_work_pending()
## [3375] 9008fe8fad82 - slab: Fix too strict alignment check in create_cache()
## [3374] 2ae6bdb1e145 - io_uring/region: return negative -E2BIG in io_create_region()
## [3373] e358e09a894d - io_uring: protect register tracing
## [3372] c750629caeca - io_uring: remove io_uring_cqwait_reg_arg
## [3371] a652958888fb - io_uring/region: fix error codes after failed vmap
## [3370] d617b3147d54 - io_uring: restore back registered wait arguments
## [3369] 93238e661855 - io_uring: add memory region registration
## [3368] dfbbfbf19187 - io_uring: introduce concept of memory regions
## [3367] 83e041522eb9 - io_uring: temporarily disable registered waits
## [3366] 3730aebbdac8 - io_uring: disable ENTER_EXT_ARG_REG for IOPOLL
## [3365] 68685fa20edc - io_uring: fortify io_pin_pages with a warning
## [3364] b9d69371e8fa - io_uring: fix invalid hybrid polling ctx leaks
## [3363] adc77b19f62d - ocfs2: fix uninitialized value in ocfs2_file_read_iter()
## [3362] d369735e02ef - ublk: fix ublk_ch_mmap() for 64K page size
## [3361] a43e236fb9ae - io_uring/uring_cmd: fix buffer index retrieval
## [3360] df3b8ca604f2 - io_uring/cmd: let cmds to know about dying task
## [3359] 1cc86aeadafd - btrfs: add struct io_btrfs_cmd as type for io_uring_cmd_to_pdu()
## [3358] 34310c442e17 - btrfs: add io_uring command for encoded reads (ENCODED_READ ioctl)
## [3357] 039c878db7ad - io_uring/rsrc: add & apply io_req_assign_buf_node()
## [3356] 4f219fcce5e4 - io_uring/rsrc: remove '->ctx_ptr' of 'struct io_rsrc_node'
## [3355] 0d98c5090868 - io_uring/rsrc: pass 'struct io_ring_ctx' reference to rsrc helpers
## [3354] fc9f59de26af - io_uring: Switch to use hrtimer_setup_on_stack()
## [3353] c95d36585b9f - io_uring: Remove redundant hrtimer's callback function setup
## [3352] af0a2ffef0e6 - io_uring: avoid normal tw intermediate fallback
## [3351] 6bf90bd8c58a - io_uring/napi: add static napi tracking strategy
## [3350] 71afd926f292 - io_uring/napi: clean up __io_napi_do_busy_loop
## [3349] db1e1adf6f99 - io_uring/napi: Use lock guards
## [3348] a5e26f49fef9 - io_uring/napi: improve __io_napi_add
## [3347] 45b3941d09d1 - io_uring/napi: fix io_napi_entry RCU accesses
## [3346] 2f3cc8e441c9 - io_uring/napi: protect concurrent io_napi_entry timeout accesses
## [3345] 483242714fcc - io_uring: prevent speculating sq_array indexing
## [3344] b6f58a3f4aa8 - io_uring: move struct io_kiocb from task_struct to io_uring_task
## [3343] 6ed368cc5d5d - io_uring: remove task ref helpers
## [3342] f03baece0818 - io_uring: move cancelations to be io_uring_task based
## [3341] 6f94cbc29ada - io_uring/rsrc: split io_kiocb node type assignments
## [3340] 6af82f7614a2 - io_uring/rsrc: encode node type and ctx together
## [3339] 66d7ac6bdb07 - replace do_setxattr() with saner helpers.
## [3338] 01ee194d1aba - io_uring: add support for hybrid IOPOLL
## [3337] c1329532d5aa - io_uring/rsrc: allow cloning with node replacements
## [3336] b16e920a1909 - io_uring/rsrc: allow cloning at an offset
## [3335] d50f94d761a5 - io_uring/rsrc: get rid of the empty node and dummy_ubuf
## [3334] 4007c3d8c22a - io_uring/rsrc: add io_reset_rsrc_node() helper
## [3333] 5f3829fdd69d - io_uring/filetable: kill io_reset_alloc_hint() helper
## [3332] cb1717a7cd0f - io_uring/filetable: remove io_file_from_index() helper
## [3331] b54a14041ee6 - io_uring/rsrc: add io_rsrc_node_lookup() helper
## [3330] 3597f2786b68 - io_uring/rsrc: unify file and buffer resource tables
## [3329] f38f2847646f - io_uring: only initialize io_kiocb rsrc_nodes when needed
## [3328] 0701db743920 - io_uring/rsrc: add an empty io_rsrc_node for sparse buffer entries
## [3327] fbbb8e991d86 - io_uring/rsrc: get rid of io_rsrc_node allocation cache
## [3326] 7029acd8a950 - io_uring/rsrc: get rid of per-ring io_rsrc_node list
## [3325] 1d60d74e8526 - io_uring/rw: fix missing NOWAIT check for O_DIRECT start write
## [3324] a14968aea637 - gpio: fix uninit-value in swnode_find_gpio
## [3323] 5eed4fb274cd - nvme: re-fix error-handling for io_uring nvme-passthrough
## [3322] e410ffca5886 - io_uring/rsrc: kill io_charge_rsrc_node()
## [3321] 743fb58a35cd - io_uring/splice: open code 2nd direct file assignment
## [3320] aaa736b18623 - io_uring: specify freeptr usage for SLAB_TYPESAFE_BY_RCU io_kiocb cache
## [3319] ff1256b8f3c4 - io_uring/rsrc: move struct io_fixed_file to rsrc.h header
## [3318] a85f31052bce - io_uring/nop: add support for testing registered files and buffers
## [3317] aa00f67adc2c - io_uring: add support for fixed wait regions
## [3316] 371b47da25e1 - io_uring: change io_get_ext_arg() to use uaccess begin + end
## [3315] 0a54a7dd0a12 - io_uring: switch struct ext_arg from __kernel_timespec to timespec64
## [3314] b898b8c99ead - io_uring/sqpoll: wait on sqd->wait for thread parking
## [3313] 79cfe9e59c2a - io_uring/register: add IORING_REGISTER_RESIZE_RINGS
## [3312] d090bffab609 - io_uring/memmap: explicitly return -EFAULT for mmap on NULL rings
## [3311] 81d8191eb99d - io_uring: abstract out a bit of the ring filling logic
## [3310] 09d0a8ea7fac - io_uring: move max entry definition and ring sizing into header
## [3309] 882dec6c39c4 - io_uring/net: clean up io_msg_copy_hdr
## [3308] 52838787350d - io_uring/net: don't alias send user pointer reads
## [3307] ad438d070a3b - io_uring/net: don't store send address ptr
## [3306] 93db98f6f1d6 - io_uring/net: split send and sendmsg prep helpers
## [3305] e6d43739d0ee - io_uring: kill 'imu' from struct io_kiocb
## [3304] 51c967c6c9ea - io_uring/net: move send zc fixed buffer import to issue path
## [3303] 1caa00d6b616 - io_uring: remove 'issue_flags' argument for io_req_set_rsrc_node()
## [3302] 003f82b58c99 - io_uring/rw: get rid of using req->imu
## [3301] 892d3e80e1b9 - io_uring/uring_cmd: get rid of using req->imu
## [3300] c91979006023 - io_uring/rsrc: don't assign bvec twice in io_import_fixed()
## [3299] 2946f08ae9ed - io_uring: clean up cqe trace points
## [3298] 9b296c625ac1 - io_uring: static_key for !IORING_SETUP_NO_SQARRAY
## [3297] 1e6e7602cc9f - io_uring: kill io_llist_xchg
## [3296] b6b3eb19dd86 - io_uring: move cancel hash tables to kvmalloc/kvfree
## [3295] 8abf47a8d61c - io_uring/cancel: get rid of init_hash_table() helper
## [3294] ba4366f57b11 - io_uring/poll: get rid of per-hashtable bucket locks
## [3293] 879ba46a38e6 - io_uring/poll: get rid of io_poll_tw_hash_eject()
## [3292] 085268829b07 - io_uring/poll: get rid of unlocked cancel hash
## [3291] 829ab73e7bca - io_uring/poll: remove 'ctx' argument from io_poll_req_delete()
## [3290] a377132154ab - io_uring/msg_ring: add support for sending a sync message
## [3289] 95d6c9229a04 - io_uring/msg_ring: refactor a few helper functions
## [3288] f4bb2f65bb81 - io_uring/eventfd: move ctx->evfd_last_cq_tail into io_ev_fd
## [3287] 83a4f865e273 - io_uring/eventfd: abstract out ev_fd grab + release helpers
## [3286] 3ca5a3560414 - io_uring/eventfd: move trigger check into a helper
## [3285] 60c5f15800f2 - io_uring/eventfd: move actual signaling part into separate helper
## [3284] 3c90b80df5b5 - io_uring/eventfd: check for the need to async notifier earlier
## [3283] 165126dc5e23 - io_uring/eventfd: abstract out ev_fd put helper
## [3282] 2ff949441802 - block: fix sanity checks in blk_rq_map_user_bvec
## [3281] 5e52f71f858e - nvme: use helpers to access io_uring cmd space
## [3280] dc7e76ba7a60 - io_uring: IORING_OP_F[GS]ETXATTR is fine with REQ_F_FIXED_FILE
## [3279] ae6a888a4357 - io_uring/rw: fix wrong NOWAIT check in io_rw_init_file()
## [3278] 8f7033aa4089 - io_uring/sqpoll: ensure task state is TASK_RUNNING when running task_work
## [3277] 858e686a30d7 - io_uring/rsrc: ignore dummy_ubuf for buffer cloning
## [3276] 28aabffae6be - io_uring/sqpoll: close race on waiting for sqring entries
## [3275] f7c913438533 - io_uring/rw: allow pollable non-blocking attempts for !FMODE_NOWAIT
## [3274] c9d952b9103b - io_uring/rw: fix cflags posting for single issue multishot read
## [3273] c314094cb4cf - io_uring/net: harden multishot termination case for recv
## [3272] 17ea56b752b6 - io_uring: fix casts to io_req_flags_t
## [3271] 3a87e264290d - io_uring: fix memory leak when cache init fail
## [3270] eac2ca2d682f - io_uring: check if we need to reschedule during overflow flush
## [3269] eed138d67d99 - io_uring: improve request linking trace
## [3268] 04beb6e0e08c - io_uring: check for presence of task_work rather than TIF_NOTIFY_SIGNAL
## [3267] 53d69bdd5b19 - io_uring/sqpoll: do the napi busy poll outside the submission block
## [3266] 2f6a55e4235f - io_uring: clean up a type in io_uring_register_get_file()
## [3265] 7f44beadcc11 - io_uring/sqpoll: do not put cpumask on stack
## [3264] a09c17240bdf - io_uring/sqpoll: retain test for whether the CPU is valid
## [3263] 9753c642a53b - io_uring/rsrc: change ubuf->ubuf_end to length tracking
## [3262] 8b0c6025a02d - io_uring/rsrc: get rid of io_mapped_ubuf->folio_mask
## [3261] 636119af94f2 - io_uring: rename "copy buffers" to "clone buffers"
## [3260] 7cc2a6eadcd7 - io_uring: add IORING_REGISTER_COPY_BUFFERS method
## [3259] 0b6d253e084a - io_uring/register: provide helper to get io_ring_ctx from 'fd'
## [3258] bfc0aa7a512f - io_uring/rsrc: add reference count to struct io_mapped_ubuf
## [3257] 021b153f7d41 - io_uring/rsrc: clear 'slot' entry upfront
## [3256] 50c52250e2d7 - block: implement async io_uring discard cmd
## [3255] a6ccb48e1366 - io_uring/cmd: give inline space in request to cmds
## [3254] 6746ee4c3a18 - io_uring/cmd: expose iowq to cmds
## [3253] 84eacf177faa - io_uring/io-wq: inherit cpuset of cgroup in io worker
## [3252] 0997aa5497c7 - io_uring/io-wq: do not allow pinning outside of cpuset
## [3251] 90bfb28d5fa8 - io_uring/rw: drop -EOPNOTSUPP check in __io_complete_rw_common()
## [3250] c0a9d496e0fe - io_uring/rw: treat -EOPNOTSUPP for IOCB_NOWAIT like -EAGAIN
## [3249] ac325fc2aad5 - btrfs: do not hold the extent lock for entire read
## [3248] a6711d1cd4e2 - io_uring: port to struct kmem_cache_args
## [3247] f011c9cf04c0 - io_uring/sqpoll: do not allow pinning outside of cpuset
## [3246] 0e0bcf07ec5b - io_uring/eventfd: move refs to refcount_t
## [3245] 54001d0f2fdb - net: tls: wait for async completion on last message
## [3244] e58f5142f883 - ublk_drv: fix NULL pointer dereference in ublk_ctrl_start_recovery()
## [3243] c9f9ce65c243 - io_uring: remove unused rsrc_put_fn
## [3242] 6cf52b42c4ef - io_uring: add new line after variable declaration
## [3241] 1802656ef890 - io_uring: add GCOV_PROFILE_URING Kconfig option
## [3240] f274495aea7b - io_uring/kbuf: return correct iovec count from classic buffer peek
## [3239] 1c47c0d6014c - io_uring/rsrc: ensure compat iovecs are copied correctly
## [3238] ae98dbf43d75 - io_uring/kbuf: add support for incremental buffer consumption
## [3237] 6733e678ba12 - io_uring/kbuf: pass in 'len' argument for buffer commit
## [3236] 641a6816795b - Revert "io_uring: Require zeroed sqe->len on provided-buffers send"
## [3235] 2c8fa70bf3e9 - io_uring/kbuf: move io_ring_head_to_buf() to kbuf.h
## [3234] ecd5c9b29643 - io_uring/kbuf: add io_kbuf_commit() helper
## [3233] c0390d541128 - fs: pack struct file
## [3232] 120443321dfa - io_uring/kbuf: shrink nr_iovs/mode in struct buf_sel_arg
## [3231] 7ed9e09e2d13 - io_uring: wire up min batch wake timeout
## [3230] 1100c4a2656d - io_uring: add support for batch wait timeout
## [3229] cebf123c634a - io_uring: implement our own schedule timeout handling
## [3228] 45a41e74b8f4 - io_uring: move schedule wait logic into helper
## [3227] f42b58e44802 - io_uring: encapsulate extraneous wait flags into a separate struct
## [3226] 2b8e976b9842 - io_uring: user registered clockid for wait timeouts
## [3225] d29cb3726f03 - io_uring: add absolute mode wait timeouts
## [3224] d5cce407e4f5 - io_uring/napi: postpone napi timeout adjustment
## [3223] 489b80060cf6 - io_uring/napi: refactor __io_napi_busy_loop()
## [3222] a69307a55454 - io_uring/kbuf: turn io_buffer_list booleans into flags
## [3221] 566a424212d7 - io_uring/net: use ITER_UBUF for single segment send maps
## [3220] 03e02e8f95fe - io_uring/kbuf: use 'bl' directly rather than req->buf_list
## [3219] 7255cd894539 - io_uring: micro optimization of __io_sq_thread() condition
## [3218] a8edbb424b13 - io_uring/rsrc: enable multi-hugepage buffer coalescing
## [3217] 3d6106aee473 - io_uring/rsrc: store folio shift and mask into imu
## [3216] d843634a95a6 - io_uring: add napi busy settings to the fdinfo output
## [3215] e0ee967630c8 - io_uring/kbuf: sanitize peek buffer setup
## [3214] 1fc2ac428ef7 - io_uring: fix user_data field name in comment
## [3213] e4956dc7a84d - io_uring/sqpoll: annotate debug task == current with data_race()
## [3212] 48cc7ecd3a68 - io_uring/napi: remove duplicate io_napi_entry timeout assignation
## [3211] 84f2eecf9501 - io_uring/napi: check napi_enabled in io_napi_add() before proceeding
## [3210] 8fe8ac24adcd - io_uring/net: don't pick multiple buffers for non-bundle send
## [3209] 70ed519ed59d - io_uring/net: ensure expanded bundle send gets marked for cleanup
## [3208] 11893e144ed7 - io_uring/net: ensure expanded bundle recv gets marked for cleanup
## [3207] ed86525f1f4b - tools/include: Sync network socket headers with the kernel sources
## [3206] c3fca4fb83f7 - io_uring: remove unused local list heads in NAPI functions
## [3205] 2c762be5b798 - io_uring: keep multishot request NAPI timeout current
## [3204] 358169617602 - io_uring/napi: pass ktime to io_napi_adjust_timeout
## [3203] 342b2e395d5f - io_uring/napi: use ktime in busy polling
## [3202] 0db4618e8fab - io_uring/msg_ring: fix uninitialized use of target_req->flags
## [3201] 29d63b94036e - io_uring: align iowq and task request error handling
## [3200] a2b72b81fb3b - io_uring: kill REQ_F_CANCEL_SEQ
## [3199] f1dcdfcadb0c - io_uring: simplify io_uring_cmd return
## [3198] e142e9cd8891 - io_uring: fix io_match_task must_hold
## [3197] bd44d7e902c2 - io_uring: don't allow netpolling with SETUP_IOPOLL
## [3196] f8b632e89a10 - io_uring: tighten task exit cancellations
## [3195] bcc87d978b83 - io_uring: fix error pbuf checking
## [3194] 24dce1c538a7 - io_uring: fix lost getsockopt completions
## [3193] 3f74e6bd3b84 - mm/mglru: fix overshooting shrinker memory
## [3192] febc33cb352a - bcachefs: set fgf order hint before starting a buffered write
## [3191] ad00e629145b - io_uring/net: check socket is valid in io_bind()/io_listen()
## [3190] 943ad0b62e3c - kernel: rerun task_work while freezing in get_signal()
## [3189] 0453aad676ff - io_uring/io-wq: limit retrying worker initialisation
## [3188] f7c696a56cc7 - io_uring/napi: Remove unnecessary s64 cast
## [3187] 07838f7fd529 - iommufd: Add iommufd fault object
## [3186] 93d8032f4143 - io_uring/net: cleanup io_recv_finish() bundle handling
## [3185] 6e92c646f5a4 - io_uring/net: don't clear msg_inq before io_recv_buf_select() needs it
## [3184] 3b7c16be30e3 - io_uring/msg_ring: fix overflow posting
## [3183] 060f4ba6e403 - io_uring/net: move charging socket out of zc io_uring
## [3182] 8515f1661ca1 - MAINTAINERS: change Pavel Begunkov from io_uring reviewer to maintainer
## [3181] be4f5d9c992b - io_uring/msg_ring: use kmem_cache_free() to free request
## [3180] b0727b1243cd - io_uring/msg_ring: check for dead submitter task
## [3179] d98b7d7dda72 - netfs: Fix io_uring based write-through
## [3178] dbcabac138fd - io_uring: signal SQPOLL task_work with TWA_SIGNAL_NO_IPI
## [3177] 26b97668e533 - io_uring: remove dead struct io_submit_state member
## [3176] 50cf5f3842af - io_uring/msg_ring: add an alloc cache for io_kiocb entries
## [3175] 0617bb500bfa - io_uring/msg_ring: improve handling of target CQE posting
## [3174] f33096a3c99c - io_uring: add io_add_aux_cqe() helper
## [3173] c3ac76f9ca7a - io_uring: add remote task_work execution helper
## [3172] d57afd8bb7f2 - io_uring/msg_ring: tighten requirement for remote posting
## [3171] a23800f08a60 - io_uring/rsrc: fix incorrect assignment of iter->nr_segs in io_import_fixed
## [3170] 6bc9199d0c84 - io_uring: Allocate only necessary memory in io_probe
## [3169] 3e05b222382e - io_uring: Fix probe of disabled operations
## [3168] ff140cc8628a - io_uring: Introduce IORING_OP_LISTEN
## [3167] 7481fd93fa0a - io_uring: Introduce IORING_OP_BIND
## [3166] bb6aaf736680 - net: Split a __sys_listen helper for io_uring
## [3165] dc2e77979412 - net: Split a __sys_bind helper for io_uring
## [3164] 3b87184f7eff - io_uring/advise: support 64-bit lengths
## [3163] 11d194669271 - io_uring/rsrc: remove redundant __set_current_state() post schedule()
## [3162] 3474d1b93f89 - io_uring/io-wq: make io_wq_work flags atomic
## [3161] f2a93294edce - io_uring: use 'state' consistently
## [3160] 200f3abd14db - io_uring/eventfd: move eventfd handling to separate file
## [3159] 60b6c075e8eb - io_uring/eventfd: move to more idiomatic RCU free usage
## [3158] f4eaf8eda89e - io_uring/rsrc: Drop io_copy_iov in favor of iovec API
## [3157] 81cc927d9c5e - io_uring: Drop per-ctx dummy_ubuf
## [3156] f4a1254f2a07 - io_uring: fix cancellation overwriting req->flags
## [3155] 54559642b961 - io_uring/rsrc: don't lock while !TASK_RUNNING
## [3154] 73254a297c2d - io_uring: fix possible deadlock in io_register_iowq_max_workers()
## [3153] 91215f70ea85 - io_uring/io-wq: avoid garbage value of 'match' in io_wq_enqueue()
## [3152] 415ce0ea55c5 - io_uring/napi: fix timeout calculation
## [3151] 5fc16fa5f13b - io_uring: check for non-NULL file pointer in io_file_can_poll()
## [3150] 18414a4a2eab - io_uring/net: assign kmsg inq/flags before buffer selection
## [3149] e112311615a2 - io_uring/rw: Free iovec before cleaning async data
## [3148] 06fe9b1df108 - io_uring: don't attempt to mmap larger than what the user asks for
## [3147] 9b038d004ce9 - netfs: Fix io_uring based write-through
## [3146] 547988ad0f96 - io_uring: remove checks for NULL 'sq_offset'
## [3145] d13ddd9c893f - io_uring/sqpoll: ensure that normal task_work is also run timely
## [3144] ac287da2e0ea - io_uring/net: wire up IORING_CQE_F_SOCK_NONEMPTY for accept
## [3143] deb1e496a835 - io_uring: support to inject result for NOP
## [3142] 3d8f874bd620 - io_uring: fail NOP if non-zero op flags is passed in
## [3141] d3da8e985926 - io_uring/net: add IORING_ACCEPT_POLL_FIRST flag
## [3140] 7dcc758cca43 - io_uring/net: add IORING_ACCEPT_DONTWAIT flag
## [3139] 340f634aa43d - io_uring/filetable: don't unnecessarily clear/reset bitmap
## [3138] 8d2a83a97f1c - btrfs: make NOCOW checks for existence of checksums in a range more efficient
## [3137] 8a565304927f - io_uring/io-wq: Use set_bit() and test_bit() at worker->flags
## [3136] 59b28a6e37e6 - io_uring/msg_ring: cleanup posting to IOPOLL vs !IOPOLL ring
## [3135] 79996b45f7b2 - io_uring: Require zeroed sqe->len on provided-buffers send
## [3134] 19352a1d3954 - io_uring/notif: disable LAZY_WAKE for linked notifs
## [3133] ef42b85a5609 - io_uring/net: fix sendzc lazy wake polling
## [3132] a4d416dc6098 - io_uring/msg_ring: reuse ctx->submitter_task read using READ_ONCE instead of re-reading it
## [3131] 039a2e800bcd - io_uring/rw: reinstate thread check for retries
## [3130] 6fe4220912d1 - io_uring/notif: implement notification stacking
## [3129] 5a569469b973 - io_uring/notif: simplify io_notif_flush()
## [3128] 65bada80dec1 - net: add callback for setting a ubuf_info to skb
## [3127] 7ab4f16f9e24 - net: extend ubuf_info callback to ops structure
## [3126] 2f9c9515bdfd - io_uring/net: support bundles for recv
## [3125] a05d1f625c7a - io_uring/net: support bundles for send
## [3124] 35c8711c8fc4 - io_uring/kbuf: add helpers for getting/peeking multiple buffers
## [3123] ac5f71a3d9d7 - io_uring/net: add provided buffer support for IORING_OP_SEND
## [3122] 3e747dedd47b - io_uring/net: add generic multishot retry helper
## [3121] df604d2ad480 - io_uring/rw: ensure retry condition isn't lost
## [3120] c4ce0ab27646 - io_uring/sqpoll: work around a potential audit memory leak
## [3119] d6e295061f23 - io_uring/notif: shrink account_pages to u32
## [3118] 2e730d8de457 - io_uring/notif: remove ctx var from io_notif_tw_complete
## [3117] 7e58d0af5a58 - io_uring/notif: refactor io_tx_ubuf_complete()
## [3116] 686b56cbeedc - io_uring: ensure overflow entries are dropped when ring is exiting
## [3115] 4d0f4a541349 - io_uring/timeout: remove duplicate initialization of the io_timeout list.
## [3114] 6b231248e97f - io_uring: consolidate overflow flushing
## [3113] 8d09a88ef9d3 - io_uring: always lock __io_cqring_overflow_flush
## [3112] 408024b95927 - io_uring: open code io_cqring_overflow_flush()
## [3111] e45ec969d17a - io_uring: remove extra SQPOLL overflow flush
## [3110] a5bff51850c8 - io_uring: unexport io_req_cqe_overflow()
## [3109] 8c9a6f549e65 - io_uring: separate header for exported net bits
## [3108] d285da7dbd3b - io_uring/net: set MSG_ZEROCOPY for sendzc in advance
## [3107] 6b7f864bb705 - io_uring/net: get rid of io_notif_complete_tw_ext
## [3106] 998632921d28 - io_uring/net: merge ubuf sendzc callbacks
## [3105] bbbef3e9d2a8 - io_uring: return void from io_put_kbuf_comp()
## [3104] c29006a2456b - io_uring: remove io_req_put_rsrc_locked()
## [3103] d9713ad3fa22 - io_uring: remove async request cache
## [3102] de96e9ae69a1 - io_uring: turn implicit assumptions into a warning
## [3101] f39130004d3a - io_uring: kill dead code in io_req_complete_post
## [3100] 285207f67c9b - io_uring/kbuf: remove dead define
## [3099] 1da2f311ba53 - io_uring: fix warnings on shadow variables
## [3098] f15ed8b4d0ce - io_uring: move mapping/allocation helpers to a separate file
## [3097] 18595c0a58ae - io_uring: use unpin_user_pages() where appropriate
## [3096] 87585b05757d - io_uring/kbuf: use vm_insert_pages() for mmap'ed pbuf ring
## [3095] e270bfd22a2a - io_uring/kbuf: vmap pinned buffer ring
## [3094] 1943f96b3816 - io_uring: unify io_pin_pages()
## [3093] 09fc75e0c035 - io_uring: use vmap() for ring mapping
## [3092] 3ab1db3c6039 - io_uring: get rid of remap_pfn_range() for mapping rings/sqes
## [3091] 0f21a9574b1d - io_uring: Avoid anonymous enums in io_uring uapi
## [3090] 22537c9f7941 - io_uring: use the right type for work_llist empty check
## [3089] a80929d1cd53 - io_uring: Remove the now superfluous sentinel elements from ctl_table array
## [3088] 4e9706c6c8d1 - io_uring: Remove unused function
## [3087] 77a1cd5e7957 - io_uring: re-arrange Makefile order
## [3086] 05eb5fe22646 - io_uring: refill request cache in memory order
## [3085] da22bdf38be2 - io_uring/poll: shrink alloc cache size to 32
## [3084] 414d0f45c316 - io_uring/alloc_cache: switch to array based caching
## [3083] e10677a8f698 - io_uring: drop ->prep_async()
## [3082] 5eff57fa9f3a - io_uring/uring_cmd: defer SQE copying until it's needed
## [3081] d10f19dff56e - io_uring/uring_cmd: switch to always allocating async data
## [3080] e2ea5a706913 - io_uring/net: move connect to always using async data
## [3079] d6f911a6b22f - io_uring/rw: add iovec recycling
## [3078] cca6571381a0 - io_uring/rw: cleanup retry path
## [3077] 0d10bd77a1be - io_uring: get rid of struct io_rw_state
## [3076] a9165b83c193 - io_uring/rw: always setup io_async_rw for read/write requests
## [3075] d80f94070130 - io_uring/net: drop 'kmsg' parameter from io_req_msg_cleanup()
## [3074] 75191341785e - io_uring/net: add iovec recycling
## [3073] 9f8539fe299c - io_uring/net: remove (now) dead code in io_netmsg_recycle()
## [3072] 6498c5c97ce7 - io_uring: kill io_msg_alloc_async_prep()
## [3071] 50220d6ac8ff - io_uring/net: get rid of ->prep_async() for send side
## [3070] c6f32c7d9e09 - io_uring/net: get rid of ->prep_async() for receive side
## [3069] 3ba8345aec88 - io_uring/net: always set kmsg->msg.msg_control_user before issue
## [3068] 790b68b32a67 - io_uring/net: always setup an io_async_msghdr
## [3067] f5b00ab2221a - io_uring/net: unify cleanup handling
## [3066] 4a3223f7bfda - io_uring/net: switch io_recv() to using io_async_msghdr
## [3065] 54cdcca05abd - io_uring/net: switch io_send() and io_send_zc() to using io_async_msghdr
## [3064] 0ae9b9a14d54 - io_uring/alloc_cache: shrink default max entries from 512 to 128
## [3063] 29f858a7c6e0 - io_uring: remove timeout/poll specific cancelations
## [3062] 254176234222 - io_uring: flush delayed fallback task_work in cancelation
## [3061] c133b3b06b06 - io_uring: clean up io_lockdep_assert_cq_locked
## [3060] 0667db14e1f0 - io_uring: refactor io_req_complete_post()
## [3059] 23fbdde6205d - io_uring: remove current check from complete_post
## [3058] 902ce82c2aa1 - io_uring: get rid of intermediate aux cqe caches
## [3057] e5c12945be50 - io_uring: refactor io_fill_cqe_req_aux
## [3056] 8e5b3b89ecaf - io_uring: remove struct io_tw_state::locked
## [3055] 92219afb980e - io_uring: force tw ctx locking
## [3054] 6e6b8c62120a - io_uring/rw: avoid punting to io-wq directly
## [3053] 1afdb76038e2 - nvme/io_uring: use helper for polled completions
## [3052] 36a005b9c66e - io_uring/cmd: document some uring_cmd related helpers
## [3051] e1eef2e56cb0 - io_uring/cmd: fix tw <-> issue_flags conversion
## [3050] 6edd953b6ec7 - io_uring/cmd: kill one issue_flags to tw conversion
## [3049] da12d9ab5889 - io_uring/cmd: move io_uring_try_cancel_uring_cmd()
## [3048] d94979904105 - timerfd: convert to ->read_iter()
## [3047] 4fe82aedeb8a - io_uring/net: restore msg_control on sendzc retry
## [3046] 978e5c19dfef - io_uring: Fix io_cqring_wait() not restoring sigmask on get_timespec64() failure
## [3045] 04c35ab3bdae - x86/mm/pat: fix VM_PAT handling in COW mappings
## [3044] 561e4f9451d6 - io_uring/kbuf: hold io_buffer_list reference over mmap
## [3043] 6b69c4ab4f68 - io_uring/kbuf: protect io_buffer_list teardown with a reference
## [3042] 3b80cff5a4d1 - io_uring/kbuf: get rid of bl->is_ready
## [3041] 09ab7eff3820 - io_uring/kbuf: get rid of lower BGID lists
## [3040] 73eaa2b58349 - io_uring: use private workqueue for exit work
## [3039] bee1d5becdf5 - io_uring: disable io-wq execution of multishot NOWAIT requests
## [3038] 2a975d426c82 - io_uring/rw: don't allow multishot reads without NOWAIT support
## [3037] 1251d2025c3e - io_uring/sqpoll: early exit thread if task_context wasn't allocated
## [3036] e21e1c45e1fe - io_uring: clear opcode specific data for an early failure
## [3035] f3a640cca951 - io_uring/net: ensure async prep handlers always initialize ->done_io
## [3034] 2b35b8b43e07 - io_uring/waitid: always remove waitid entry for cancel all
## [3033] 30dab608c3cb - io_uring/futex: always remove futex entry for cancel all
## [3032] 5e3afe580a9f - io_uring: fix poll_remove stalled req completion
## [3031] e54e09c05c00 - net: remove {revc,send}msg_copy_msghdr() from exports
## [3030] 67d1189d1095 - io_uring: Fix release of pinned pages when __io_uaddr_map fails
## [3029] 9219e4a9d4ad - io_uring/kbuf: rename is_mapped
## [3028] 2c5c0ba1179d - io_uring: simplify io_pages_free
## [3027] cef59d1ea717 - io_uring: clean rings on NO_MMAP alloc fail
## [3026] 0a3737db8479 - io_uring/rw: return IOU_ISSUE_SKIP_COMPLETE for multishot retry
## [3025] 6f0974eccbf7 - io_uring: don't save/restore iowait state
## [3024] 606559dc4fa3 - io_uring: Fix sqpoll utilization check racing with dying sqpoll
## [3023] 1af04699c597 - io_uring/net: dedup io_recv_finish req completion
## [3022] e0e4ab52d170 - io_uring: refactor DEFER_TASKRUN multishot checks
## [3021] 3a96378e22cc - io_uring: fix mshot io-wq checks
## [3020] d9b441889c35 - io_uring/net: add io_req_msg_cleanup() helper
## [3019] fb6328bc2ab5 - io_uring/net: simplify msghd->msg_inq checking
## [3018] 186daf238529 - io_uring/kbuf: rename REQ_F_PARTIAL_IO to REQ_F_BL_NO_RECYCLE
## [3017] 9817ad85899f - io_uring/net: remove dependency on REQ_F_PARTIAL_IO for sr->done_io
## [3016] deaef31bc1ec - io_uring/net: correctly handle multishot recvmsg retry setup
## [3015] b5311dbc2c2e - io_uring/net: clear REQ_F_BL_EMPTY in the multishot retry handler
## [3014] 1a8ec63b2b6c - io_uring: fix io_queue_proc modifying req->flags
## [3013] 70581dcd0601 - io_uring: fix mshot read defer taskrun cqe posting
## [3012] 8ede3db5061b - io_uring/net: fix overflow check in io_recvmsg_mshot_prep()
## [3011] 86bcacc957fc - io_uring/net: correct the type of variable
## [3010] 3fcb9d17206e - io_uring/sqpoll: statistics of the true utilization of sq threads
## [3009] eb18c29dd2a3 - io_uring/net: move recv/recvmsg flags out of retry loop
## [3008] 13fe8e6825e4 - ublk: add UBLK_CMD_DEL_DEV_ASYNC
## [3007] 1221b9e982e1 - ublk: improve getting & putting ublk device
## [3006] c3f9109dbc9e - io_uring/kbuf: flag request if buffer pool is empty after buffer pick
## [3005] 792060de8b3e - io_uring/net: improve the usercopy for sendmsg/recvmsg
## [3004] c55978024d12 - io_uring/net: move receive multishot out of the generic msghdr path
## [3003] 52307ac4f2b5 - io_uring/net: unify how recvmsg and sendmsg copy in the msghdr
## [3002] b820de741ae4 - fs/aio: Restrict kiocb_set_cancel_fn() to I/O submitted via libaio
## [3001] b4ccc4dd1330 - io_uring/napi: enable even with a timeout of 0
## [3000] 871760eb7af5 - io_uring: kill stale comment for io_cqring_overflow_kill()
## [2999] a37ee9e117ef - io_uring/net: fix multishot accept overflow handling
## [2998] c8d8fc3b2d9d - io_uring/sqpoll: use the correct check for pending task_work
## [2997] 78f9b61bd8e5 - io_uring: wake SQPOLL task when task_work is added to an empty queue
## [2996] 428f13826855 - io_uring/napi: ensure napi polling is aborted when work is available
## [2995] 3fb1764c6b57 - io_uring: Don't include af_unix.h.
## [2994] ef1186c1a875 - io_uring: add register/unregister napi function
## [2993] 8d0c12a80cde - io-uring: add napi busy poll support
## [2992] b4bb1900c12e - io_uring: add support for ftruncate
## [2991] a6e959bd3d6b - io_uring: Simplify the allocation of slab caches
## [2990] da08d2edb020 - io_uring: re-arrange struct io_ring_ctx to reduce padding
## [2989] af5d68f8892f - io_uring/sqpoll: manage task_work privately
## [2988] 2708af1adc11 - io_uring: pass in counter to handle_tw_list() rather than return it
## [2987] 42c0905f0cac - io_uring: cleanup handle_tw_list() calling convention
## [2986] 3cdc4be114a9 - io_uring/poll: improve readability of poll reference decrementing
## [2985] 9fe3eaea4a35 - io_uring: remove unconditional looping in local task_work handling
## [2984] 670d9d3df880 - io_uring: remove next io_kiocb fetch in task_work running
## [2983] 170539bdf109 - io_uring: handle traditional task_work in FIFO order
## [2982] 4c98b89175a2 - io_uring: remove 'loops' argument from trace_io_uring_task_work_run()
## [2981] 592b4805432a - io_uring: remove looping around handling traditional task_work
## [2980] 8435c6f380d6 - io_uring/kbuf: cleanup passing back cflags
## [2979] 949249e25f10 - io_uring/rw: remove dead file == NULL check
## [2978] 4caa74fdce7d - io_uring: cleanup io_req_complete_post()
## [2977] bfe30bfde279 - io_uring: mark the need to lock/unlock the ring as unlikely
## [2976] 95041b93e90a - io_uring: add io_file_can_poll() helper
## [2975] 521223d7c229 - io_uring/cancel: don't default to setting req->work.cancel_seq
## [2974] 4bcb982cce74 - io_uring: expand main struct io_kiocb flags to 64-bits
## [2973] e516c3fc6c18 - block: optimise in irq bio put caching
## [2972] 5492a490e64e - io_uring: use file_mnt_idmap helper
## [2971] 1279f9d9dec2 - af_unix: Call kfree_skb() for dead unix_(sk)->oob_skb in GC.
## [2970] 72bd80252fee - io_uring/net: fix sr->len for IORING_OP_RECV with MSG_WAITALL and buffers
## [2969] 99a7a5b9943e - af_unix: Remove CONFIG_UNIX_SCM.
## [2968] 11498715f266 - af_unix: Remove io_uring code for GC.
## [2967] 76b367a2d831 - io_uring/net: limit inline multishot retries
## [2966] 704ea888d646 - io_uring/poll: add requeue return code from poll multishot handling
## [2965] 91e5d765a82f - io_uring/net: un-indent mshot retry path in io_recv_finish()
## [2964] e84b01a880f6 - io_uring/poll: move poll execution helpers higher up
## [2963] c79f52f0656e - io_uring/rw: ensure poll based multishot read retries appropriately
## [2962] 082fd1ea1f98 - fsnotify: optimize the case of no parent watcher
## [2961] 16bae3e13778 - io_uring: enable audit and restrict cred override for IORING_OP_FIXED_FD_INSTALL
## [2960] b4bc35cf8704 - io_uring: combine cq_wait_nr checks
## [2959] e8c407717b48 - io_uring: clean *local_work_add var naming
## [2958] d381099f980b - io_uring: clean up local tw add-wait sync
## [2957] dc12d1799ce7 - io_uring: adjust defer tw counting
## [2956] baf59771343d - io_uring/register: guard compat syscall with CONFIG_COMPAT
## [2955] 3f302388d458 - io_uring/rsrc: improve code generation for fixed file assignment
## [2954] fe80eb15dea5 - io_uring/rw: cleanup io_rw_done()
## [2953] 95e7249691f0 - scsi: virtio_scsi: Add mq_poll support
## [2952] 6ff1407e24e6 - io_uring: ensure local task_work is run on wait timeout
## [2951] 8ab3b09755d9 - io_uring: use mempool KASAN hook
## [2950] 280ec6ccb642 - kasan: rename kasan_slab_free_mempool to kasan_mempool_poison_object
## [2949] d293b1a89694 - io_uring/kbuf: add method for returning provided buffer ring head
## [2948] 0a535eddbe0d - io_uring/rw: ensure io->bytes_done is always initialized
## [2947] 6e5e6d274956 - io_uring: drop any code related to SCM_RIGHTS
## [2946] a4104821ad65 - io_uring/unix: drop usage of io_uring socket
## [2945] c43203154d8a - io_uring/register: move io_uring_register(2) related code to register.c
## [2944] 1ba0e9d69b20 - io_uring/cmd: fix breakage in SOCKET_URING_OP_SIOC* implementation
## [2943] 595e52284d24 - io_uring/poll: don't enable lazy wake for POLLEXCLUSIVE
## [2942] dc18b89ab113 - io_uring/openclose: add support for IORING_OP_FIXED_FD_INSTALL
## [2941] 055c15626a45 - io_uring/cmd: inline io_uring_cmd_get_task
## [2940] 6b04a3737057 - io_uring/cmd: inline io_uring_cmd_do_in_task_lazy
## [2939] b66509b8497f - io_uring: split out cmd api into a separate header
## [2938] e0b23d9953b0 - io_uring: optimise ltimeout for inline execution
## [2937] 9b43ef3d5253 - io_uring: don't check iopoll if request completes
## [2936] 24fa3ae9467f - file: remove pointless wrapper
## [2935] 69db702c8387 - io_uring/af_unix: disable sending io_uring over sockets
## [2934] 705318a99a13 - io_uring/af_unix: disable sending io_uring over sockets
## [2933] a58a173444a6 - MIPS: kernel: Clear FPU states when setting up kernel threads
## [2932] 9865346b7e83 - io_uring/kbuf: check for buffer list readiness after NULL check
## [2931] e53f7b54b1fd - io_uring/kbuf: Fix an NULL vs IS_ERR() bug in io_alloc_pbuf_ring()
## [2930] f7b32e785042 - io_uring: fix mutex_unlock with unreferenced ctx
## [2929] 8fadb86d4ced - io_uring: remove uring_cmd cookie
## [2928] 73363c262d6a - io_uring: use fget/fput consistently
## [2927] 5cf4f52e6d8a - io_uring: free io_buffer_list entries via RCU
## [2926] 07d6063d3d3b - io_uring/kbuf: prune deferred locked cache when tearing down
## [2925] b10b73c102a2 - io_uring/kbuf: recycle freed mapped buffer ring entries
## [2924] c392cbecd8ec - io_uring/kbuf: defer release of mapped buffer rings
## [2923] 120ae5859363 - eventfd: simplify eventfd_signal_mask()
## [2922] edecf1689768 - io_uring: enable io_mem_alloc/free to be used in other parts
## [2921] 6f007b140663 - io_uring: don't guard IORING_OFF_PBUF_RING with SETUP_NO_MMAP
## [2920] 820d070feb66 - io_uring: don't allow discontig pages for IORING_SETUP_NO_MMAP
## [2919] d6fef34ee4d1 - io_uring: fix off-by one bvec index
## [2918] 8479063f1fbe - io_uring/fs: consider link->flags when getting path for LINKAT
## [2917] a0d45c3f596b - io_uring/fdinfo: remove need for sqpoll lock for thread/pid retrieval
## [2916] 4f0b9194bc11 - fs: Rename anon_inode_getfile_secure() and anon_inode_getfd_secure()
## [2915] e53759298a7d - io_uring: do not clamp read length for multishot read
## [2914] 49fbe9948678 - io_uring: do not allow multishot read to set addr or len
## [2913] 89d528ba2f82 - io_uring: indicate if io_kbuf_recycle did recycle anything
## [2912] 1147dd050356 - nvme: fix error-handling for io_uring nvme-passthrough
## [2911] f688944cfb81 - io_uring/rw: add separate prep handler for fixed read/write
## [2910] 0e984ec88da9 - io_uring/rw: add separate prep handler for readv/writev
## [2909] f8f9ab2d9811 - io_uring/net: ensure socket is marked connected on connect retry
## [2908] 0df96fb71a39 - io_uring/rw: don't attempt to allocate async data if opcode doesn't need it
## [2907] 1939316bf988 - io_uring: kiocb_done() should *not* trust ->ki_pos if ->{read,write}_iter() failed
## [2906] 838b35bb6a89 - io_uring/rw: disable IOCB_DIO_CALLER_COMP
## [2905] 7644b1a1c9a7 - io_uring/fdinfo: lock SQ thread while retrieving thread cpu/pid
## [2904] 7060d3ccdd4c - apparmor: mark new functions static
## [2903] b9ec913212e6 - selftests/bpf/sockopt: Add io_uring support
## [2902] 4232c6e349f3 - io_uring/cmd: Introduce SOCKET_URING_OP_SETSOCKOPT
## [2901] a5d2f99aff6b - io_uring/cmd: Introduce SOCKET_URING_OP_GETSOCKOPT
## [2900] d2cac3ec8237 - io_uring/cmd: return -EOPNOTSUPP if net is disabled
## [2899] ba6e0e5cb5b2 - selftests/net: Extract uring helpers to be reusable
## [2898] 7746a6adfc81 - tools headers: Grab copy of io_uring.h
## [2897] 5fea44a6e05b - io_uring/cmd: Pass compat mode in issue_flags
## [2896] 0b05b0cd78c9 - net/socket: Break down __sys_getsockopt
## [2895] 1406245c2945 - net/socket: Break down __sys_setsockopt
## [2894] 3f31e0d14d44 - bpf: Add sockptr support for setsockopt
## [2893] a615f67e1a42 - bpf: Add sockptr support for getsockopt
## [2892] 6ce4a93dbb5b - io_uring/poll: use IOU_F_TWQ_LAZY_WAKE for wakeups
## [2891] 50d910d27362 - io_uring: use files_lookup_fd_locked()
## [2890] c4371d90633b - apparmor: add io_uring mediation
## [2889] 8b51a3956d44 - io_uring: fix crash with IORING_SETUP_NO_MMAP and invalid SQ ring address
## [2888] 216c8f5ef0f2 - ublk: replace monitor with cancelable uring_cmd
## [2887] 85248d670b71 - ublk: move ublk_cancel_dev() out of ub->mutex
## [2886] 3421c7f68bba - ublk: make sure io cmd handled in submitter task context
## [2885] 8d211285c6d4 - test/vsock: io_uring rx/tx tests
## [2884] dcc55d7bb230 - vsock: enable SOCK_SUPPORT_ZC bit
## [2883] 03adc61edad4 - audit,io_uring: io_uring openat triggers audit reference count underflow
## [2882] b3a4dbc89d40 - io_uring/kbuf: Use slab for struct io_buffer objects
## [2881] f74c746e476b - io_uring/kbuf: Allow the full buffer id space for provided buffers
## [2880] ab69838e7c75 - io_uring/kbuf: Fix check of BID wrapping in provided buffers
## [2879] 223ef4743164 - io_uring: don't allow IORING_SETUP_NO_MMAP rings on highmem pages
## [2878] 1658633c0465 - io_uring: ensure io_lockdep_assert_cq_locked() handles disabled rings
## [2877] f8024f1f36a3 - io_uring/kbuf: don't allow registered buffer rings on highmem pages
## [2876] 922a2c78f136 - io_uring/rsrc: cleanup io_pin_pages()
## [2875] a52d4f657568 - io_uring/fs: remove sqe->rw_flags checking from LINKAT
## [2874] 8f350194d5cf - io_uring: add support for vectored futex waits
## [2873] e9a56c9325ef - futex: make the vectored futex operations available
## [2872] 194bb58c6090 - io_uring: add support for futex wake and wait
## [2871] 12a4be50aff3 - futex: factor out the futex wake handling
## [2870] 93b8cc60c37b - io_uring: cancelable uring_cmd
## [2869] 528ce6781726 - io_uring: retain top 8bits of uring_cmd flags for kernel internal use
## [2868] d78bfa1346ab - block/null_blk: add queue_rqs() support
## [2867] f31ecf671ddc - io_uring: add IORING_OP_WAITID support
## [2866] 2e521a2064bf - exit: add internal include file with helpers
## [2865] fc68fcda0491 - io_uring/rw: add support for IORING_OP_READ_MULTISHOT
## [2864] d2d778fbf996 - io_uring/rw: mark readv/writev as vectored in the opcode definition
## [2863] a08d195b586a - io_uring/rw: split io_read() into a helper
## [2862] c21a8027ad8a - io_uring/net: fix iter retargeting for selected buf
## [2861] 023464fe33a5 - Revert "io_uring: fix IO hang in io_wq_put_and_exit from do_exit()"
## [2860] 27122c079f5b - io_uring: fix unprotected iopoll overflow
## [2859] 45500dc4e01c - io_uring: break out of iowq iopoll on teardown
## [2858] 76d3ccecfa18 - io_uring: add a sysctl to disable io_uring system-wide
## [2857] 32f5dea040ee - io_uring/fdinfo: only print ->sq_array[] if it's there
## [2856] 5a26e45edb46 - null_blk: fix poll request timeout handling
## [2855] b484a40dc1f1 - io_uring: fix IO hang in io_wq_put_and_exit from do_exit()
## [2854] bd6fc5da4c51 - io_uring: Don't set affinity on a dying sqpoll thread
## [2853] 194505b55dd7 - ext4: drop dio overwrite only flag and associated warning
## [2852] 644c4a7a721f - io_uring: move iopoll ctx fields around
## [2851] 0aa7aa5f7669 - io_uring: move multishot cqe cache in ctx
## [2850] c9def23dde52 - io_uring: separate task_work/waiting cache line
## [2849] 18df385f42f0 - io_uring: banish non-hot data to end of io_ring_ctx
## [2848] d7f06fea5d6b - io_uring: move non aligned field to the end
## [2847] 2af89abda7d9 - io_uring: add option to remove SQ indirection
## [2846] e5598d6ae626 - io_uring: compact SQ/CQ heads/tails
## [2845] 093a650b7572 - io_uring: force inline io_fill_cqe_req
## [2844] ec26c225f06f - io_uring: merge iopoll and normal completion paths
## [2843] 54927baf6c19 - io_uring: reorder cqring_flush and wakeups
## [2842] 59fbc409e716 - io_uring: optimise extra io_get_cqe null check
## [2841] 20d6b6338704 - io_uring: refactor __io_get_cqe()
## [2840] b24c5d752962 - io_uring: simplify big_cqe handling
## [2839] 31d3ba924fd8 - io_uring: cqe init hardening
## [2838] a0727c738309 - io_uring: improve cqe !tracing hot path
## [2837] 99a9e0b83ab9 - io_uring: stop calling free_compound_page()
## [2836] e484fd73f4bd - io_uring: use kiocb_{start,end}_write() helpers
## [2835] ed0360bbab72 - fs: create kiocb_{start,end}_write() helpers
## [2834] a370167fe526 - io_uring: rename kiocb_end_write() local helper
## [2833] 04d9244c9420 - io_uring/rsrc: Annotate struct io_mapped_ubuf with __counted_by
## [2832] ebdfefc09c6d - io_uring/sqpoll: fix io-wq affinity when IORING_SETUP_SQPOLL is used
## [2831] d246c759c47e - io_uring: simplify io_run_task_work_sig return
## [2830] 19a63c402170 - io_uring/rsrc: keep one global dummy_ubuf
## [2829] b6b2bb58a754 - io_uring: never overflow io_aux_cqe
## [2828] 056695bffa4b - io_uring: remove return from io_req_cqe_overflow()
## [2827] 00b0db562485 - io_uring: open code io_fill_cqe_req()
## [2826] b2e74db55dd9 - io_uring/net: don't overflow multishot recv
## [2825] 1bfed2334971 - io_uring/net: don't overflow multishot accept
## [2824] 22f7fb80e6d9 - io_uring/io-wq: don't gate worker wake up success on wake_up_process()
## [2823] de36a15f9a38 - io_uring/io-wq: reduce frequency of acct->lock acquisitions
## [2822] 78848b9b0562 - io_uring/io-wq: don't grab wq->lock for worker activation
## [2821] 89226307b109 - io_uring: remove unnecessary forward declaration
## [2820] 17bc28374cd0 - io_uring: have io_file_put() take an io_kiocb rather than the file
## [2819] 9f69a259576a - io_uring/splice: use fput() directly
## [2818] 3aaf22b62a92 - io_uring/fdinfo: get rid of ref tryget
## [2817] fe9da61ffcca - zonefs: fix synchronous direct writes to sequential files
## [2816] 2bc057692599 - block: don't make REQ_POLLED imply REQ_NOWAIT
## [2815] 9e4bef2ba9e0 - io_uring: cleanup 'ret' handling in io_iopoll_check()
## [2814] dc314886cb3d - io_uring: break iopolling on signal
## [2813] 17619322e56b - io_uring: kill io_uring userspace examples
## [2812] 569f5308e543 - io_uring: fix false positive KASAN warnings
## [2811] cfdbaa3a291d - io_uring: fix drain stalls by invalid SQE
## [2810] d4b30eed51d7 - io_uring/rsrc: Remove unused declaration io_rsrc_put_tw()
## [2809] b97f96e22f05 - io_uring: annotate the struct io_kiocb slab for appropriate user copy
## [2808] 8e9fad0e70b7 - io_uring: Add io_uring command support for sockets
## [2807] 56675f8b9f9b - io_uring/parisc: Adjust pgoff in io_uring mmap() for parisc
## [2806] 72dbde0f2afb - io_uring: correct check for O_TMPFILE
## [2805] 8c052fb3002e - iomap: support IOCB_DIO_CALLER_COMP
## [2804] 099ada2c8726 - io_uring/rw: add write support for IOCB_DIO_CALLER_COMP
## [2803] 53e7d08f6d6e - ublk: fail to start device if queue setup is interrupted
## [2802] 7b72d661f1f2 - io_uring: gate iowait schedule on having pending requests
## [2801] 32832a407a71 - io_uring: Fix io_uring mmap() by using architecture-provided get_unmapped_area()
## [2800] a9be20226958 - io_uring: treat -EAGAIN for REQ_F_NOWAIT as final for io-wq
## [2799] 6adc2272aaaf - io_uring: don't audit the capability check in io_uring_create()
## [2798] f77569d22ad9 - io_uring/cancel: wire up IORING_ASYNC_CANCEL_OP for sync cancel
## [2797] d7b8b079a8f6 - io_uring/cancel: support opcode based lookup and cancelation
## [2796] 8165b566049b - io_uring/cancel: add IORING_ASYNC_CANCEL_USERDATA
## [2795] a30badf66de8 - io_uring: use cancelation match helper for poll and timeout requests
## [2794] 3a372b66923e - io_uring/cancel: fix sequence matching for IORING_ASYNC_CANCEL_ANY
## [2793] aa5cd116f3c2 - io_uring/cancel: abstract out request match helper
## [2792] faa9c0ee3cab - io_uring/timeout: always set 'ctx' in io_cancel_data
## [2791] ad711c5d113f - io_uring/poll: always set 'ctx' in io_cancel_data
## [2790] 8a796565cec3 - io_uring: Use io_schedule* in cqring wait
## [2789] 9408d8a37e6c - nvme: improved uring polling
## [2788] dfbe5561ae93 - io_uring: flush offloaded and delayed task_work on exit
## [2787] 10e1c0d59006 - io_uring: remove io_fallback_tw() forward declaration
## [2786] b65db9211ecb - io_uring/net: use proper value for msg_inq
## [2785] 99160af413b4 - nvme-mpath: fix I/O failure with EAGAIN when failing over I/O
## [2784] c98c81a4ac37 - io_uring: merge conditional unlock flush helpers
## [2783] 0fdb9a196c67 - io_uring: make io_cq_unlock_post static
## [2782] ff12617728fa - io_uring: inline __io_cq_unlock
## [2781] 55b6a69fed5d - io_uring: fix acquire/release annotations
## [2780] f432b76bcc93 - io_uring: kill io_cq_unlock()
## [2779] 91c7884ac9a9 - io_uring: remove IOU_F_TWQ_FORCE_NORMAL
## [2778] 2fdd6fb5ff95 - io_uring: don't batch task put on reqs free
## [2777] 5a754dea27fb - io_uring: move io_clean_op()
## [2776] 3b7a612fd0db - io_uring: inline io_dismantle_req()
## [2775] 6ec9afc7f4cb - io_uring: remove io_free_req_tw
## [2774] 247f97a5f19b - io_uring: open code io_put_req_find_next
## [2773] 26fed83653d0 - io_uring/net: use the correct msghdr union member in io_sendmsg_copy_hdr
## [2772] 78d0d2063bab - io_uring/net: disable partial retries for recvmsg with cmsg
## [2771] b1dc492087db - io_uring/net: clear msg_controllen on partial sendmsg retry
## [2770] 4bfb0c9af832 - io_uring: add helpers to decode the fixed file file_ptr
## [2769] f432c8c8c12b - io_uring: use io_file_from_index in io_msg_grab_file
## [2768] 60a666f097a8 - io_uring: use io_file_from_index in __io_sync_cancel
## [2767] 8487f083c6ff - io_uring: return REQ_F_ flags from io_file_get_flags
## [2766] 3beed235d1a1 - io_uring: remove io_req_ffs_set
## [2765] b57c7cd1c176 - io_uring: remove a confusing comment above io_file_get_flags
## [2764] 53cfd5cea7f3 - io_uring: remove the mode variable in io_file_get_flags
## [2763] b9a6c9459a5a - io_uring: remove __io_file_supports_nowait
## [2762] ef7dfac51d8e - io_uring/poll: serialize poll linked timer start with poll removal
## [2761] adeaa3f290ec - io_uring/io-wq: clear current->worker_private on exit
## [2760] cac9e4418f4c - io_uring/net: save msghdr->msg_control for retries
## [2759] 38b57833de1d - f2fs: flag as supporting buffered async reads
## [2758] fd37b884003c - io_uring/io-wq: don't clear PF_IO_WORKER on exit
## [2757] 4826c59453b3 - io_uring: wait interruptibly for request completions on exit
## [2756] 89207c669bbf - selftests/mm: gup_longterm: add liburing tests
## [2755] 81b1e3f91d77 - selftests/mm: factor out detection of hugetlb page sizes into vm_util
## [2754] 34ed8d0dcd69 - io_uring: rsrc: delegate VMA file-backed check to GUP
## [2753] 54d020692b34 - mm/gup: remove unused vmas parameter from get_user_pages()
## [2752] 003f242b0dc1 - io_uring: get rid of unnecessary 'length' variable
## [2751] d86eaed185e9 - io_uring: cleanup io_aux_cqe() API
## [2750] c92fcfc2bab5 - io_uring: avoid indirect function calls for the hottest task_work
## [2749] 4ea0bf4b98d6 - io_uring: undeprecate epoll_ctl support
## [2748] 533ab73f5b5c - io_uring: unlock sqd->lock before sq thread release CPU
## [2747] f026be0e1e88 - nvme: optimise io_uring passthrough completion
## [2746] 5f3139fc4699 - io_uring/cmd: add cmd lazy tw wake helper
## [2745] eca2040972b4 - scsi: block: ioprio: Clean up interface definition
## [2744] 29dc5d06613f - ublk: kill queuing request by task_work_add
## [2743] 5498bf28d8f2 - io_uring: annotate offset timeout races
## [2742] 3af0356c162c - io_uring: maintain ordering for DEFER_TASKRUN tw list
## [2741] ac5902f84bb5 - ublk: fix AB-BA lockdep warning
## [2740] a2741c58ac67 - io_uring/net: don't retry recvmsg() unnecessarily
## [2739] 7d41bcb7f32f - io_uring/net: push IORING_CQE_F_SOCK_NONEMPTY into io_recv_finish()
## [2738] 88fc8b8463b0 - io_uring/net: initalize msghdr->msg_inq to known value
## [2737] bf34e697931f - io_uring/net: initialize struct msghdr more sanely for io_recv()
## [2736] a7533584728d - net/tcp: optimise io_uring zc ubuf refcounting
## [2735] eea96a3e2c90 - net/tcp: don't peek at tail for io_uring zc
## [2734] 6e76ac595855 - io_uring: Add io_uring_setup flag to pre-register ring fd and never install it
## [2733] 03d89a2de25b - io_uring: support for user allocated memory for rings/sqes
## [2732] 9c189eee73af - io_uring: add ring freeing helper
## [2731] e27cef86a0ed - io_uring: return error pointer from io_mem_alloc()
## [2730] 9b1b58cacc65 - io_uring: remove sq/cq_off memset
## [2729] caec5ebe77f9 - io_uring: rely solely on FMODE_NOWAIT
## [2728] fe34db062b80 - net: set FMODE_NOWAIT for sockets
## [2727] e14cadfd80d7 - tcp: add annotations around sk->sk_shutdown accesses
## [2726] 293007b03341 - io_uring: make io_uring_sqe_cmd() unconditionally available
## [2725] d2b7fa6174bc - io_uring: Remove unnecessary BUILD_BUG_ON
## [2724] fd9b8547bc5c - io_uring: Pass whole sqe to commands
## [2723] 96c7d4f81db0 - io_uring: Create a helper to return the SQE size
## [2722] 776617db78c6 - io_uring/rsrc: check for nonconsecutive pages
## [2721] 6d2ed653185b - lsm: move hook comments docs to security/security.c
## [2720] 3c85cc43c8e7 - Revert "io_uring/rsrc: disallow multi-source reg buffers"
## [2719] ea97f6c8558e - io_uring: add support for multishot timeouts
## [2718] 2236b3905b4d - io_uring/rsrc: disassociate nodes and rsrc_data
## [2717] fc7f3a8d3a78 - io_uring/rsrc: devirtualise rsrc put callbacks
## [2716] 29b26c556e74 - io_uring/rsrc: pass node to io_rsrc_put_work()
## [2715] 4130b49991d6 - io_uring/rsrc: inline io_rsrc_put_work()
## [2714] 26147da37f3e - io_uring/rsrc: add empty flag in rsrc_node
## [2713] c376644fb915 - io_uring/rsrc: merge nodes and io_rsrc_put
## [2712] 63fea89027ff - io_uring/rsrc: infer node from ctx on io_queue_rsrc_removal
## [2711] 2e6f45ac0e64 - io_uring/rsrc: remove unused io_rsrc_node::llist
## [2710] c899a5d7d0ec - io_uring/rsrc: refactor io_queue_rsrc_removal
## [2709] c87fd583f3b5 - io_uring/rsrc: simplify single file node switching
## [2708] 9a57fffedc0e - io_uring/rsrc: clean up __io_sqe_buffers_update()
## [2707] 2f2af35f8e5a - io_uring/rsrc: inline switch_start fast path
## [2706] 0b222eeb6514 - io_uring/rsrc: remove rsrc_data refs
## [2705] 7d481e035633 - io_uring/rsrc: fix DEFER_TASKRUN rsrc quiesce
## [2704] 4ea15b56f081 - io_uring/rsrc: use wq for quiescing
## [2703] eef81fcaa61e - io_uring/rsrc: refactor io_rsrc_ref_quiesce
## [2702] c732ea242d56 - io_uring/rsrc: remove io_rsrc_node::done
## [2701] 953c37e066f0 - io_uring/rsrc: use nospec'ed indexes
## [2700] 519760df251b - io_uring/notif: add constant for ubuf_info flags
## [2699] 860e1c7f8b0b - io_uring: complete request via task work in case of DEFER_TASKRUN
## [2698] d581076b6a85 - io_uring/rsrc: extract SCM file put helper
## [2697] 2933ae6eaa05 - io_uring/rsrc: refactor io_rsrc_node_switch
## [2696] 13c223962eac - io_uring/rsrc: zero node's rsrc data on alloc
## [2695] 528407b1e0ea - io_uring/rsrc: consolidate node caching
## [2694] 786788a8cfe0 - io_uring/rsrc: add lockdep checks
## [2693] 8ce4269eeedc - io_uring: add irq lockdep checks
## [2692] ceac766a5581 - io_uring/kbuf: remove extra ->buf_ring null check
## [2691] 8b1df11f9733 - io_uring: shut io_prep_async_work warning
## [2690] 27a67079c0e5 - io_uring/uring_cmd: take advantage of completion batching
## [2689] 360cd42c4e95 - io_uring: optimise io_req_local_work_add
## [2688] c66ae3ec38f9 - io_uring: refactor __io_cq_unlock_post_flush()
## [2687] 8751d15426a3 - io_uring: reduce scheduling due to tw
## [2686] 5150940079a3 - io_uring: inline llist_add()
## [2685] 8501fe70ae98 - io_uring: add tw add flags
## [2684] 6e7248adf8f7 - io_uring: refactor io_cqring_wake()
## [2683] d73a572df246 - io_uring: optimize local tw add ctx pinning
## [2682] ab1c590f5c9b - io_uring: move pinning out of io_req_local_work_add
## [2681] 1d1665279a84 - block: ublk: make sure that block size is set correctly
## [2680] e07fec475cc8 - usb: gadgetfs: Fix ep_read_iter to handle ITER_UBUF
## [2679] d356b3cdd00c - usb: gadget: f_fs: Fix ffs_epfile_read_iter to handle ITER_UBUF
## [2678] 758d5d64b619 - io_uring/uring_cmd: assign ioucmd->cmd at async prep time
## [2677] 69bbc6ade9d9 - io_uring/rsrc: add custom limit for node caching
## [2676] 757ef4682b6a - io_uring/rsrc: optimise io_rsrc_data refcounting
## [2675] 1f2c8f610aa6 - io_uring/rsrc: add lockdep sanity checks
## [2674] 9eae8655f9cd - io_uring/rsrc: cache struct io_rsrc_node
## [2673] 36b9818a5a84 - io_uring/rsrc: don't offload node free
## [2672] ff7c75ecaa9e - io_uring/rsrc: optimise io_rsrc_put allocation
## [2671] c824986c113f - io_uring/rsrc: rename rsrc_list
## [2670] 0a4813b1abdf - io_uring/rsrc: kill rsrc_ref_lock
## [2669] ef8ae64ffa95 - io_uring/rsrc: protect node refs with uring_lock
## [2668] 03adabe81abb - io_uring: io_free_req() via tw
## [2667] 2ad4c6d08018 - io_uring: don't put nodes under spinlocks
## [2666] 8e15c0e71b8a - io_uring/rsrc: keep cached refs per node
## [2665] b8fb5b4fdd67 - io_uring/rsrc: use non-pcpu refcounts for nodes
## [2664] e3ef728ff07b - io_uring: cap io_sqring_entries() at SQ ring size
## [2663] 2ad57931db64 - io_uring: rename trace_io_uring_submit_sqe() tracepoint
## [2662] a282967c848f - io_uring: encapsulate task_work state
## [2661] 13bfa6f15d0b - io_uring: remove extra tw trylocks
## [2660] 07d99096e163 - io_uring/io-wq: drop outdated comment
## [2659] d322818ef4c7 - io_uring: kill unused notif declarations
## [2658] eb47943f2238 - io-wq: Drop struct io_wqe
## [2657] fcb46c0ccc7c - io_uring/kbuf: disallow mapping a badly aligned provided ring buffer
## [2656] e1fe7ee885dc - io_uring: Add KASAN support for alloc_caches
## [2655] efba1a9e653e - io_uring: Move from hlist to io_wq_work_node
## [2654] da64d6db3bd3 - io_uring: One wqe per wq
## [2653] c56e022c0a27 - io_uring: add support for user mapped provided buffer ring
## [2652] 81cf17cd3ab3 - io_uring/kbuf: rename struct io_uring_buf_reg 'pad' to'flags'
## [2651] 25a2c188a0a0 - io_uring/kbuf: add buffer_list->is_mapped member
## [2650] ba56b63242d1 - io_uring/kbuf: move pinning of provided buffer ring into helper
## [2649] d808459b2e31 - io_uring: Adjust mapping wrt architecture aliasing requirements
## [2648] d4755e15386c - io_uring: avoid hashing O_DIRECT writes if the filesystem doesn't need it
## [2647] d8aeb44a9ae3 - fs: add FMODE_DIO_PARALLEL_WRITE flag
## [2646] f1437cd1e535 - scsi: scsi_debug: Drop sdebug_queue
## [2645] 57f7225a4fe2 - scsi: scsi_debug: Only allow sdebug_max_queue be modified when no shosts
## [2644] b4a72c0589fd - io_uring: fix memory leak when removing provided buffers
## [2643] c0921e51dab7 - io_uring: fix return value when removing provided buffers
## [2642] fd30d1cdcc4f - io_uring: fix poll/netmsg alloc caches
## [2641] 4ff0b50de8ca - io_uring/rsrc: fix rogue rsrc node grabbing
## [2640] 005308f7bdac - io_uring/poll: clear single/double poll flags on poll arming
## [2639] 02a4d923e440 - io_uring/rsrc: fix null-ptr-deref in io_file_bitmap_get()
## [2638] 74e2e17ee1f8 - io_uring/net: avoid sending -ECONNABORTED on repeated connection requests
## [2637] 9d2789ac9d60 - block/io_uring: pass in issue_flags for uring_cmd task_work handling
## [2636] 54bdd67d0f88 - blk-mq: remove hybrid polling
## [2635] 4985e7b2c002 - block: ublk_drv: mark device as LIVE before adding disk
## [2634] 72fd6d738c99 - selftests/x86/lam: Add io_uring test cases for linear-address masking
## [2633] d2acf789088b - io_uring/rsrc: fix folio accounting
## [2632] 5da28edd7bd5 - io_uring/msg_ring: let target know allocated index
## [2631] 6acd352dfee5 - io_uring: rsrc: Optimize return value variable 'ret'
## [2630] a5fc1441af77 - io_uring/sqpoll: Do not set PF_NO_SETAFFINITY on sqpoll threads
## [2629] b711ef5e176b - scsi: hisi_sas: Sync complete queue for poll queue
## [2628] fa780334a8c3 - io_uring: silence variable ‘prev’ set but not used warning
## [2627] 03b3d6be73e8 - io_uring/uring_cmd: ensure that device supports IOPOLL
## [2626] 01e68ce08a30 - io_uring/io-wq: stop setting PF_NO_SETAFFINITY on io-wq workers
## [2625] 10369080454d - net: reclaim skb->scm_io_uring bit
## [2624] 1cd2aca64a5d - lsm: move the io_uring hook comments to security/security.c
## [2623] 1947ddf9b3d5 - io_uring/poll: don't pass in wake func to io_init_poll_iocb()
## [2622] 54aa7f2330b8 - io_uring: fix fget leak when fs don't support nowait buffered read
## [2621] c16bda37594f - io_uring/poll: allow some retries for poll triggering spuriously
## [2620] 310726c33ad7 - block: be a bit more careful in checking for NULL bdev while polling
## [2619] 7605c43d67fa - io_uring: remove MSG_NOSIGNAL from recvmsg
## [2618] 977bc8735610 - io_uring/rsrc: always initialize 'folio' to NULL
## [2617] 57bebf807e2a - io_uring/rsrc: optimise registered huge pages
## [2616] b000ae0ec2d7 - io_uring/rsrc: optimise single entry advance
## [2615] edd478269640 - io_uring/rsrc: disallow multi-source reg buffers
## [2614] 9a1563d17206 - io_uring: remove unused wq_list_merge
## [2613] 48ba08374e77 - io_uring: fix size calculation when registering buf ring
## [2612] 6bf65a1b3668 - io_uring/rsrc: fix a comment in io_import_fixed()
## [2611] 8d664282a03f - io_uring: rename 'in_idle' to 'in_cancel'
## [2610] ce8e04f6e5d3 - io_uring: consolidate the put_ref-and-return section of adding work
## [2609] 9c7c4bc98693 - ublk: remove check IO_URING_F_SQE128 in ublk_ch_uring_cmd
## [2608] 07b679f70d73 - virtio-blk: support completion batching for the IRQ path
## [2607] 67205f80be99 - brd: mark as nowait compatible
## [2606] 7d3fd88d61a4 - io_uring: Support calling io_uring_register with a registered ring fd
## [2605] fbe870a72fd1 - io_uring,audit: don't log IORING_OP_MADVISE
## [2604] 2f2bb1ffc998 - io_uring: mark task TASK_RUNNING before handling resume/task work
## [2603] cc342a21930f - io_uring: use bvec_set_page to initialize a bvec
## [2602] 7d28631786b2 - mpage: stop using bdev_{read,write}_page
## [2601] 29baef789c83 - block: ublk: extending queue_size to fix overflow
## [2600] 73a166d97492 - ublk_drv: don't probe partitions if the ubq daemon isn't trusted
## [2599] 0ffae640ad83 - io_uring: always go async for unsupported open flags
## [2598] c31cc60fddd1 - io_uring: always go async for unsupported fadvise flags
## [2597] aebb224fd4fc - io_uring: for requests that require async, force it
## [2596] 6bb30855560e - io_uring: if a linked request has REQ_F_FORCE_ASYNC then run it async
## [2595] f58680085478 - io_uring: add reschedule point to handle_tw_list()
## [2594] fcc926bb8579 - io_uring: add a conditional reschedule to the IOPOLL cancelation loop
## [2593] 50470fc5723a - io_uring: return normal tw run linking optimisation
## [2592] cb6bf7f285c2 - io_uring: refactor tctx_task_work
## [2591] 5afa46507139 - io_uring: refactor io_put_task helpers
## [2590] c8576f3e612d - io_uring: refactor req allocation
## [2589] b5083dfa3667 - io_uring: improve io_get_sqe
## [2588] b2aa66aff60c - io_uring: kill outdated comment about overflow flush
## [2587] c10bb6468481 - io_uring: use user visible tail in io_uring_poll()
## [2586] f499254474a8 - io_uring: pass in io_issue_def to io_assign_file()
## [2585] c1755c25a719 - io_uring: Enable KASAN for request cache
## [2584] b5d3ae202fbf - io_uring: handle TIF_NOTIFY_RESUME when checking for task_work
## [2583] 8572df941cbe - io_uring/msg-ring: ensure flags passing works for task_work completions
## [2582] f30bd4d03824 - io_uring: Split io_issue_def struct
## [2581] a7dd27828b00 - io_uring: Rename struct io_op_def
## [2580] 68a2cc1bba98 - io_uring: refactor __io_req_complete_post
## [2579] 632ffe095674 - io_uring: optimise ctx flags layout
## [2578] 31f084b7b028 - io_uring: simplify fallback execution
## [2577] 89800a2dd570 - io_uring: don't export io_put_task()
## [2576] b0b7a7d24b66 - io_uring: return back links tw run optimisation
## [2575] 88b80534f60f - io_uring: make io_sqpoll_wait_sq return void
## [2574] c3f4d39ee4bc - io_uring: optimise deferred tw execution
## [2573] d80c0f00d047 - io_uring: add io_req_local_work_add wake fast path
## [2572] 130bd686d9be - io_uring: waitqueue-less cq waiting
## [2571] 3181e22fb799 - io_uring: wake up optimisations
## [2570] bca39f390585 - io_uring: add lazy poll_wq activation
## [2569] 7b235dd82ad3 - io_uring: separate wq for ring polling
## [2568] 360173ab9e1a - io_uring: move io_run_local_work_locked
## [2567] 3e5655552a82 - io_uring: mark io_run_local_work static
## [2566] 2f413956cc8a - io_uring: don't set TASK_RUNNING in local tw runner
## [2565] bd550173acc2 - io_uring: refactor io_wake_function
## [2564] dde40322ae20 - io_uring: move submitter_task out of cold cacheline
## [2563] 81594e7e7a14 - io_uring: remove excessive unlikely on IS_ERR
## [2562] cbeb47a7b5f0 - io_uring/msg_ring: Pass custom flags to the cqe
## [2561] d33a39e57768 - io_uring: keep timeout in io_wait_queue
## [2560] 46ae7eef44f6 - io_uring: optimise non-timeout waiting
## [2559] 326a9e482e21 - io_uring: set TASK_RUNNING right after schedule
## [2558] 490c00eb4fa5 - io_uring: simplify io_has_work
## [2557] 846072f16eed - io_uring: mimimise io_cqring_wait_schedule
## [2556] 3fcf19d592d5 - io_uring: parse check_cq out of wq waiting
## [2555] 140102ae9a9f - io_uring: move defer tw task checks
## [2554] 1414d6298584 - io_uring: kill io_run_task_work_ctx
## [2553] f36ba6cf1ab6 - io_uring: don't iterate cq wait fast path
## [2552] 0c4fe008c9cb - io_uring: rearrange defer list checks
## [2551] 36632d062975 - io_uring: Replace 0-length array with flexible array
## [2550] ef5c600adb1d - io_uring: always prep_async for drain requests
## [2549] 8e4ff684762b - block: ublk: move ublk_chr_class destroying after devices are removed
## [2548] b00c51ef8f72 - io_uring/net: cache provided buffer group value for multishot receives
## [2547] 8caa03f10bf9 - io_uring/poll: don't reissue in case of poll race on multishot request
## [2546] 8579538c89e3 - io_uring/msg_ring: fix remote queue to disabled ring
## [2545] 56d8e3180c06 - io_uring/msg_ring: fix flagging remote execution
## [2544] e12d7a46f65a - io_uring/msg_ring: fix missing lock on overflow for IOPOLL
## [2543] 423d5081d045 - io_uring/msg_ring: move double lock/unlock helpers higher up
## [2542] 6a6dcae8f486 - blk-mq: Build default queue map via group_cpus_evenly()
## [2541] 774656479397 - block: fix hctx checks for batch allocation
## [2540] c19175141079 - caif: don't assume iov_iter type
## [2539] 544d163d659d - io_uring: lock overflowing for IOPOLL
## [2538] 6e5aedb9324a - io_uring/poll: attempt request issue after racy poll wakeup
## [2537] ea97cbebaf86 - io_uring/fdinfo: include locked hash table in fdinfo output
## [2536] febb985c06cb - io_uring/poll: add hash if ready poll request can't complete inline
## [2535] 4397a17c1dc5 - iov_iter: move iter_ubuf check inside restore WARN
## [2534] 1e23db450cff - io_uring: use iter_ubuf for single range imports
## [2533] 4b61152e107a - io_uring: switch network send/recv to ITER_UBUF
## [2532] e6db6f9398da - io_uring/io-wq: only free worker if it was allocated for creation
## [2531] 12521a5d5cb7 - io_uring: fix CQ waiting timeout handling
## [2530] 59b745bb4e0b - io_uring: move 'poll_multi_queue' bool in io_ring_ctx
## [2529] fa8e442e832a - ublk: honor IO_URING_F_NONBLOCK for handling control command
## [2528] f26cc9593581 - io_uring: lockdep annotate CQ locking
## [2527] 9ffa13ff78a0 - io_uring: pin context while queueing deferred tw
## [2526] af82425c6a2d - io_uring/io-wq: free worker if task_work creation is canceled
## [2525] 9eb803402a2a - uapi:io_uring.h: allow linux/time_types.h to be skipped
## [2524] 343190841a1f - io_uring: check for valid register opcode earlier
## [2523] 23fffb2f09ce - io_uring/cancel: re-grab ctx mutex after finishing wait
## [2522] 52ea806ad983 - io_uring: finish waiting before flushing overflow entries
## [2521] 5ad70eb27d2b - MAINTAINERS: io_uring: Add include/trace/events/io_uring.h
## [2520] 6c3e8955d4bd - io_uring/net: fix cleanup after recycle
## [2519] 990a4de57e44 - io_uring/net: ensure compat import handlers clear free_iov
## [2518] 35d90f95cfa7 - io_uring: include task_work run after scheduling in wait for events
## [2517] 6434ec0186b8 - io_uring: don't use TIF_NOTIFY_SIGNAL to test for availability of task_work
## [2516] 44a84da45272 - io_uring: use call_rcu_hurry if signaling an eventfd
## [2515] a8cf95f93610 - io_uring: fix overflow handling regression
## [2514] e5f30f6fb29a - io_uring: ease timeout flush locking requirements
## [2513] 6971253f0787 - io_uring: revise completion_lock locking
## [2512] ea011ee10231 - io_uring: protect cq_timeouts with timeout_lock
## [2511] fcd0ccd836ff - mm/gup: fix gup_pud_range() for dax
## [2510] 761c61c15903 - io_uring/msg_ring: flag target ring as having task_work, if needed
## [2509] f66f73421f0a - io_uring: skip spinlocking for ->task_complete
## [2508] 6d043ee1164c - io_uring: do msg_ring in target task via tw
## [2507] 172113101641 - io_uring: extract a io_msg_install_complete helper
## [2506] 11373026f296 - io_uring: get rid of double locking
## [2505] 77e443ab294c - io_uring: never run tw and fallback in parallel
## [2504] d34b1b0b6779 - io_uring: use tw for putting rsrc
## [2503] 17add5cea2bb - io_uring: force multishot CQEs into task context
## [2502] e6aeb2721d3b - io_uring: complete all requests in task context
## [2501] 1b346e4aa8e7 - io_uring: don't check overflow flush failures
## [2500] a85381d8326d - io_uring: skip overflow CQE posting for dying ring
## [2499] 4c979eaefa43 - io_uring: improve io_double_lock_ctx fail handling
## [2498] ef0ec1ad0311 - io_uring: dont remove file from msg_ring reqs
## [2497] 998b30c3948e - io_uring: Fix a null-ptr-deref in io_tctx_exit_cb()
## [2496] ce5a23c835aa - kernel/user: Allow user_struct::locked_vm to be usable for iommufd
## [2495] 7500194a630b - io_uring: reshuffle issue_flags
## [2494] 77e3202a2196 - io_uring: don't reinstall quiesce node for each tw
## [2493] 0ced756f6412 - io_uring: improve rsrc quiesce refs checks
## [2492] 618d653a345a - io_uring: don't raw spin unlock to match cq_lock
## [2491] 443e57550670 - io_uring: combine poll tw handlers
## [2490] c3bfb57ea701 - io_uring: improve poll warning handling
## [2489] 047b6aef0966 - io_uring: remove ctx variable in io_poll_check_events
## [2488] 9805fa2d9499 - io_uring: carve io_poll_check_events fast path
## [2487] f6f7f903e78d - io_uring: kill io_poll_issue's PF_EXITING check
## [2486] 7cfe7a09489c - io_uring: clear TIF_NOTIFY_SIGNAL if set and task_work not available
## [2485] 12ad3d2d6c5b - io_uring/poll: fix poll_refs race with cancelation
## [2484] 9d94c04c0db0 - io_uring/filetable: fix file reference underflow
## [2483] a26a35e9019f - io_uring: make poll refs more robust
## [2482] 2f3893437a4e - io_uring: cmpxchg for poll arm refs release
## [2481] 5d772916855f - io_uring: keep unlock_post inlined in hot path
## [2480] c3b490930dbe - io_uring: don't use complete_post in kbuf
## [2479] 10d8bc35416d - io_uring: spelling fix
## [2478] 27f35fe9096b - io_uring: remove io_req_complete_post_tw
## [2477] 9a6924519e5e - io_uring: allow multishot polled reqs to defer completion
## [2476] b529c96a896b - io_uring: remove overflow param from io_post_aux_cqe
## [2475] 2e2ef4a1dab9 - io_uring: add lockdep assertion in io_fill_cqe_aux
## [2474] a77ab745f28d - io_uring: make io_fill_cqe_aux static
## [2473] 9b8c54755a2b - io_uring: add io_aux_cqe which allows deferred completion
## [2472] 931147ddfa6e - io_uring: allow defer completion for aux posted cqes
## [2471] 973fc83f3a94 - io_uring: defer all io_req_complete_failed
## [2470] c06c6c5d2767 - io_uring: always lock in io_apoll_task_func
## [2469] 7d4a93176e01 - ublk_drv: don't forward io commands in reserve order
## [2468] 2dac1a159216 - io_uring: remove iopoll spinlock
## [2467] 1bec951c3809 - io_uring: iopoll protect complete_post
## [2466] fa18fa2272c7 - io_uring: inline __io_req_complete_put()
## [2465] 833b5dfffc26 - io_uring: remove io_req_tw_post_queue
## [2464] 624fd779fd86 - io_uring: use io_req_task_complete() in timeout
## [2463] e276ae344a77 - io_uring: hold locks for io_req_complete_failed
## [2462] 2ccc92f4effc - io_uring: add completion locking for iopoll
## [2461] 6c16fe3c16bd - io_uring: kill io_cqring_ev_posted() and __io_cq_unlock_post()
## [2460] 4061f0ef730c - Revert "io_uring: disallow self-propelled ring polling"
## [2459] 4464853277d0 - io_uring: pass in EPOLL_URING_WAKE for eventfd signaling and wakeups
## [2458] 03e02acda8e2 - eventfd: provide a eventfd_signal_mask() helper
## [2457] caf1aeaffc3b - eventpoll: add EPOLL_URING_WAKE poll wakeup flag
## [2456] f9d567c75ec2 - io_uring: inline __io_req_complete_post()
## [2455] d75936062049 - io_uring: split tw fallback into a function
## [2454] e52d2e583e4a - io_uring: inline io_req_task_work_add()
## [2453] 23a6c9ac4dbd - io_uring: update outdated comment of callbacks
## [2452] cd42a53d25d4 - io_uring/poll: remove outdated comments of caching
## [2451] e2ad599d1ed3 - io_uring: allow multishot recv CQEs to overflow
## [2450] 515e26961295 - io_uring: revert "io_uring fix multishot accept ordering"
## [2449] ef67fcb41de6 - io_uring: do not always force run task_work in io_uring_register
## [2448] df730ec21f7b - io_uring: fix two assignments in if conditions
## [2447] 42385b02baad - io_uring/net: move mm accounting to a slower path
## [2446] 40725d1b960f - io_uring: move zc reporting from the hot path
## [2445] bedd20bcf3b0 - io_uring/net: inline io_notif_flush()
## [2444] 7fa8e84192fd - io_uring/net: rename io_uring_tx_zerocopy_callback
## [2443] fc1dd0d4fa52 - io_uring/net: preset notif tw handler
## [2442] 5bc8e8884b4e - io_uring/net: remove extra notif rsrc setup
## [2441] 3671163beb63 - io_uring: move kbuf put out of generic tw complete
## [2440] e307e6698165 - io_uring/net: introduce IORING_SEND_ZC_REPORT_USAGE flag
## [2439] e428e9613531 - LoongArch: Clear FPU/SIMD thread info flags for kernel thread
## [2438] 7fdbc5f014c3 - io_uring: disallow self-propelled ring polling
## [2437] 100d6b17c06e - io_uring: fix multishot recv request leaks
## [2436] 91482864768a - io_uring: fix multishot accept request leaks
## [2435] 539bcb57da2f - io_uring: fix tw losing poll events
## [2434] b98186aee22f - io_uring: update res mask in io_poll_check_events
## [2433] 12e4e8c7ab59 - io_uring/rw: enable bio caches for IRQ rw
## [2432] bdcdd86ca94b - btrfs: fix assertion failure and blocking during nowait buffered write
## [2431] 5576035f15df - io_uring/poll: lockdep annote io_poll_req_insert_locked
## [2430] 30a33669fa21 - io_uring/poll: fix double poll req->flags races
## [2429] 3851d25c75ed - io_uring: check for rollover of buffer ID when providing buffers
## [2428] e487ebbd1298 - selftests/vm: anon_cow: add liburing test cases
## [2427] 0fc8c2acbfc7 - io_uring: calculate CQEs from the user visible value
## [2426] 6dcabcd39894 - io_uring: fix typo in io_uring.h comment
## [2425] a348c8d4f6cf - btrfs: fix nowait buffered write returning -ENOSPC
## [2424] 9921d5013a6e - selftests/net: don't tests batched TCP io_uring zc
## [2423] 3ab6e94ca539 - ublk_drv: avoid to touch io_uring cmd in blk_mq io path
## [2422] 224e858f215a - ublk_drv: return flag of UBLK_F_URING_CMD_COMP_IN_TASK in case of module
## [2421] b3026767e15b - io_uring: unlock if __io_run_local_work locked inside
## [2420] 8de11cdc96bf - io_uring: use io_run_local_work_locked helper
## [2419] cc767e7c6913 - io_uring/net: fail zc sendmsg when unsupported by socket
## [2418] edf81438799c - io_uring/net: fail zc send when unsupported by socket
## [2417] e993ffe3da4b - net: flag sockets supporting msghdr originated zerocopy
## [2416] 996d3efeb091 - io-wq: Fix memory leak in worker creation
## [2415] 16bbdfe5fb0e - io_uring/msg_ring: Fix NULL pointer dereference in io_msg_send_fd()
## [2414] 5c61795ea97c - io_uring/rw: remove leftover debug statement
## [2413] 02bac94bd8ef - io_uring: don't iopoll from io_ring_ctx_wait_and_kill()
## [2412] 34f0bc427e94 - io_uring: reuse io_alloc_req()
## [2411] 4d5059512d28 - io_uring: kill hot path fixed file bitmap debug checks
## [2410] 38eddb2c75fb - io_uring: remove FFS_SCM
## [2409] 2ec33a6c3cca - io_uring/rw: ensure kiocb_end_write() is always called
## [2408] 00927931cb63 - io_uring: fix fdinfo sqe offsets calculation
## [2407] c86416c6ff5b - io_uring: local variable rw shadows outer variable in io_write
## [2406] 11528491c65a - io_uring/opdef: remove 'audit_skip' from SENDMSG_ZC
## [2405] 44f87745d5f2 - io_uring: optimise locking for local tw with submit_wait
## [2404] fc86f9d3bb49 - io_uring: remove redundant memory barrier in io_req_local_work_add
## [2403] 3fb1bd688172 - io_uring/net: handle -EINPROGRESS correct for IORING_OP_CONNECT
## [2402] b7a817752efc - io_uring: remove notif leftovers
## [2401] 42b6419d0aba - io_uring: correct pinned_vm accounting
## [2400] 0091bfc81741 - io_uring/af_unix: defer registered files gc to io_uring release
## [2399] d7cce96c449e - io_uring: limit registration w/ SINGLE_ISSUER
## [2398] 4add705e4eeb - io_uring: remove io_register_submitter
## [2397] 97c96e9fa366 - io_uring: simplify __io_uring_add_tctx_node
## [2396] 0e0abad2a71b - io_uring: Add missing inline to io_uring_cmd_import_fixed() dummy
## [2395] 23fd22e55b76 - nvme: wire up fixed buffer support for nvme passthrough
## [2394] 9cda70f622cd - io_uring: introduce fixed buffer support for io_uring_cmd
## [2393] a9216fac3ed8 - io_uring: add io_uring_cmd_import_fixed
## [2392] 851eb780decb - nvme: enable batched completions of passthrough IO
## [2391] 108893ddcc4d - io_uring/net: fix notif cqe reordering
## [2390] 6f10ae8a1554 - io_uring/net: don't update msg_name if not provided
## [2389] 46a525e199e4 - io_uring: don't gate task_work run on TIF_NOTIFY_SIGNAL
## [2388] b000145e9907 - io_uring/rw: defer fsnotify calls to task context
## [2387] 926078b21db9 - btrfs: enable nowait async buffered writes
## [2386] 3e4cb6ebbb2b - io_uring/net: fix fast_iov assignment in io_setup_async_msg()
## [2385] 04360d3e05e8 - io_uring/net: fix non-zc send with address
## [2384] d59bd748db0a - io_uring/poll: disable level triggered poll
## [2383] 6ae91ac9a6aa - io_uring/net: don't skip notifs for failed requests
## [2382] 7bcd9683e515 - selftests/net: enable io_uring sendzc testing
## [2381] f76c83378851 - mm: multi-gen LRU: optimize multiple memcgs
## [2380] ac35a4902374 - mm: multi-gen LRU: minimal implementation
## [2379] 4d24de9425f7 - mm: MADV_COLLAPSE: refetch vm_end after reacquiring mmap_lock
## [2378] c278d9f8ac0d - io_uring/rw: don't lose short results on io_setup_async_rw()
## [2377] bf68b5b34311 - io_uring/rw: fix unexpected link breakage
## [2376] 7cae596bc31f - io_uring: register single issuer task at creation
## [2375] 4c17a496a7a0 - io_uring/net: fix cleanup double free free_iov init
## [2374] bbae8d1f526b - ublk_drv: consider recovery feature in aborting mechanism
## [2373] e775f93f2ab9 - io_uring: ensure that cached task references are always put on exit
## [2372] aa1df3a360a0 - io_uring: fix CQE reordering
## [2371] a75155faef4e - io_uring/net: fix UAF in io_sendrecv_fail()
## [2370] 4781185da411 - selftest/net: adjust io_uring sendzc notif handling
## [2369] ec7fd2562f57 - io_uring: ensure local task_work marks task as running
## [2368] 493108d95f14 - io_uring/net: zerocopy sendmsg
## [2367] c4c0009e0b56 - io_uring/net: combine fail handlers
## [2366] b0e9b5517eb1 - io_uring/net: rename io_sendzc()
## [2365] 516e82f0e043 - io_uring/net: support non-zerocopy sendto
## [2364] 6ae61b7aa2c7 - io_uring/net: refactor io_setup_async_addr
## [2363] 5693bcce892d - io_uring/net: don't lose partial send_zc on fail
## [2362] 7e6b638ed501 - io_uring/net: don't lose partial send/recv on fail
## [2361] 47b4c6866075 - io_uring/rw: don't lose partial IO result on fail
## [2360] a47b255e9039 - io_uring: add custom opcode hooks on fail
## [2359] 3b8fdd1dc35e - io_uring/fdinfo: fix sqe dumping for IORING_SETUP_SQE128
## [2358] 4f731705cc1f - io_uring/fdinfo: get rid of unnecessary is_cqe32 variable
## [2357] c0dc995eb229 - io_uring: remove unused return from io_disarm_next
## [2356] 7924fdfeea81 - io_uring: add fast path for io_run_local_work()
## [2355] 1f8d5bbe98a1 - io_uring/iopoll: unify tw breaking logic
## [2354] 9d54bd6a3bb4 - io_uring/iopoll: fix unexpected returns
## [2353] 6567506b68b0 - io_uring: disallow defer-tw run w/ no submitters
## [2352] 76de6749d1bc - io_uring: further limit non-owner defer-tw cq waiting
## [2351] ac9e5784bbe7 - io_uring/net: use io_sr_msg for sendzc
## [2350] 0b048557db76 - io_uring/net: refactor io_sr_msg types
## [2349] cd9021e88fdd - io_uring/net: add non-bvec sg chunking callback
## [2348] 6bf8ad25fcd4 - io_uring/net: io_async_msghdr caches for sendzc
## [2347] 858c293e5d3b - io_uring/net: use async caches for async prep
## [2346] 95eafc74be5e - io_uring/net: reshuffle error handling
## [2345] e9a884285484 - io_uring: use io_cq_lock consistently
## [2344] 385c609f9bfc - io_uring: kill an outdated comment
## [2343] 4ab9d465071b - io_uring: allow buffer recycling in READV
## [2342] dac6a0eae793 - io_uring: ensure iopoll runs local task work as well
## [2341] 8ac5d85a89b4 - io_uring: add local task_work run helper that is entered locked
## [2340] a1119fb07115 - io_uring: cleanly separate request types for iopoll
## [2339] 5756a3a7e713 - io_uring: add iopoll infrastructure for io_uring_cmd
## [2338] de27e18e8617 - fs: add file_operations->uring_cmd_iopoll
## [2337] f75d5036d04c - io_uring: trace local task work run
## [2336] 21a091b970cd - io_uring: signal registered eventfd to process deferred task work
## [2335] d8e9214f119d - io_uring: move io_eventfd_put
## [2334] c0e0d6ba25f1 - io_uring: add IORING_SETUP_DEFER_TASKRUN
## [2333] 2327337b881d - io_uring: do not run task work at the start of io_uring_enter
## [2332] b4c98d59a787 - io_uring: introduce io_has_work
## [2331] 32d91f059008 - io_uring: remove unnecessary variable
## [2330] 9bd3f728223e - io_uring/opdef: rename SENDZC_NOTIF to SEND_ZC
## [2329] e3366e023497 - io_uring/net: fix zc fixed buf lifetime
## [2328] fc7222c3a9f5 - io_uring/msg_ring: check file type before putting
## [2327] 56f99b8d06ef - block: blk_queue_enter() / __bio_queue_enter() must return -EAGAIN for nowait
## [2326] 62bb0647b146 - io_uring/rw: fix error'ed retry return values
## [2325] 4d9cb92ca41d - io_uring/rw: fix short rw error handling
## [2324] 3c8400532dd8 - io_uring/net: copy addr for zc on POLL_FIRST
## [2323] 336d28a8f380 - io_uring: recycle kbuf recycle on tw requeue
## [2322] df6d3422d3ee - io_uring/kbuf: fix not advancing READV kbuf ring
## [2321] 4fa07edbb7ea - io_uring/notif: Remove the unused function io_notif_complete()
## [2320] 12c5b70c1897 - block: enable per-cpu bio caching for the fs bio set
## [2319] 916d72c10a4c - selftests/net: return back io_uring zc send tests
## [2318] b48c312be05e - io_uring/net: simplify zerocopy send user API
## [2317] 57f332246afa - io_uring/notif: remove notif registration
## [2316] d9808ceb3129 - Revert "io_uring: rename IORING_OP_FILES_UPDATE"
## [2315] 23c12d5fc02f - Revert "io_uring: add zc notification flush requests"
## [2314] 75847100c351 - selftests/net: temporarily disable io_uring zc test
## [2313] dd9373402280 - Smack: Provide read control for io_uring_cmd
## [2312] dfb58b1796d1 - io_uring/net: fix overexcessive retries
## [2311] 707527956d90 - /dev/null: add IORING_OP_URING_CMD support
## [2310] f4d653dcaa4e - selinux: implement the security_uring_cmd() LSM hook
## [2309] 2a5840124009 - lsm,io_uring: add LSM hooks for the new uring_cmd file op
## [2308] 581711c46612 - io_uring/net: save address for sendzc async execution
## [2307] 5916943943d1 - io_uring: conditional ->async_data allocation
## [2306] 53bdc88aac9a - io_uring/notif: order notif vs send CQEs
## [2305] 986e263def32 - io_uring/net: fix indentation
## [2304] 5a848b7c9e5e - io_uring/net: fix zc send link failing
## [2303] 2cacedc873ab - io_uring/net: fix must_hold annotation
## [2302] a9c3eda7eada - io_uring: fix submission-failure handling for uring-cmd
## [2301] 47abea041f89 - io_uring: fix off-by-one in sync cancelation file check
## [2300] e1d0c6d05afd - io_uring: uapi: Add `extern "C"` in io_uring.h for liburing
## [2299] c2fa700c5f76 - MAINTAINERS: Add `include/linux/io_uring_types.h`
## [2298] 79d3d1d12e6f - btrfs: don't allow large NOWAIT direct reads
## [2297] 3f743e9bbb8f - io_uring/net: use right helpers for async_data
## [2296] e6190dd0031d - ublk_drv: do not add a re-issued request aborted previously to ioucmd's task_work
## [2295] 5993000dc6b3 - io_uring/notif: raise limit on notification slots
## [2294] 86dc8f23bb1b - io_uring/net: improve zc addr import error handling
## [2293] 063604265f96 - io_uring/net: use right helpers for async recycle
## [2292] 92cb6e2e5dba - ublk_drv: update iod->addr for UBLK_IO_NEED_GET_DATA
## [2291] 9c71d39aa0f4 - io_uring: add missing BUILD_BUG_ON() checks for new io_uring_sqe fields
## [2290] f2ccb5aed7bc - io_uring: make io_kiocb_to_cmd() typesafe
## [2289] addebd9ac9ca - fs: don't randomize struct kiocb fields
## [2288] da2634e89caa - io_uring: consistently make use of io_notif_to_data()
## [2287] 3ed159c98407 - io_uring: fix error handling for io_uring_cmd
## [2286] d1f6222c4978 - io_uring: fix io_recvmsg_prep_multishot sparse warnings
## [2285] 4a933e62083e - io_uring/net: send retry for zerocopy
## [2284] cc18cc5e8203 - io_uring: mem-account pbuf buckets
## [2283] f482aa986527 - audit, io_uring, io-wq: Fix memory leak in io_sq_thread() and io_wqe_worker()
## [2282] ff2557b7224e - io_uring: pass correct parameters to io_req_set_res
## [2281] a8ce5f52efce - ublk_drv: cancel device even though disk isn't up
## [2280] 14b146b688ad - io_uring: notification completion optimisation
## [2279] bd1a3783dd74 - io_uring: export req alloc from core
## [2278] 293402e564a7 - io_uring/net: use unsigned for flags
## [2277] 6a9ce66f4d08 - io_uring/net: make page accounting more consistent
## [2276] 2e32ba5607ee - io_uring/net: checks errors of zc mem accounting
## [2275] cb309ae49da7 - io_uring/net: improve io_get_notif_slot types
## [2274] d8b6171bd58a - selftests/io_uring: test zerocopy send
## [2273] 3ff1a0d395c0 - io_uring: enable managed frags with register buffers
## [2272] 492dddb4f6e3 - io_uring: add zc notification flush requests
## [2271] 4379d5f15b3f - io_uring: rename IORING_OP_FILES_UPDATE
## [2270] 63809137ebb5 - io_uring: flush notifiers after sendzc
## [2269] 10c7d33ecd51 - io_uring: sendzc with fixed buffers
## [2268] 092aeedb750a - io_uring: allow to pass addr into sendzc
## [2267] e29e3bd4b968 - io_uring: account locked pages for non-fixed zc
## [2266] 06a5464be84e - io_uring: wire send zc request type
## [2265] bc24d6bd32df - io_uring: add notification slot registration
## [2264] 68ef5578efc8 - io_uring: add rsrc referencing for notifiers
## [2263] e58d498e81ba - io_uring: complete notifiers in tw
## [2262] eb4a299b2f95 - io_uring: cache struct io_notif
## [2261] eb42cebb2cf2 - io_uring: add zc notification infrastructure
## [2260] e70cb60893ca - io_uring: export io_put_task()
## [2259] e02b66512738 - io_uring: initialise msghdr::msg_ubuf
## [2258] 0dd316ba8692 - mm: honor FGP_NOWAIT for page cache page allocation
## [2257] 1c849b481b3e - io_uring: Add tracepoint for short writes
## [2256] e053aaf4da56 - io_uring: fix issue with io_write() not always undoing sb_start_write()
## [2255] 4e17aaab5435 - io_uring: Add support for async buffered writes
## [2254] f6b543fd03d3 - io_uring: ensure REQ_F_ISREG is set async offload
## [2253] 48904229928d - io_uring: Don't require reinitable percpu_ref
## [2252] 9b0fc3c054ff - io_uring: fix types in io_recvmsg_multishot_overflow
## [2251] 4ccc6db0900f - io_uring: Use atomic_long_try_cmpxchg in __io_account_mem
## [2250] 9bb66906f23e - io_uring: support multishot in recvmsg
## [2249] 72c531f8ef30 - net: copy from user before calling __get_compat_msghdr
## [2248] 7fa875b8e53c - net: copy from user before calling __copy_msghdr
## [2247] 6d2f75a0cf30 - io_uring: support 0 length iov in buffer select in compat
## [2246] e2df2ccb753e - io_uring: fix multishot ending when not polled
## [2245] 43e0bbbd0b0e - io_uring: add netmsg cache
## [2244] 9731bc9855dc - io_uring: impose max limit on apoll cache
## [2243] 9b797a37c4bd - io_uring: add abstraction around apoll cache
## [2242] 9da7471ed10d - io_uring: move apoll cache to poll.c
## [2241] e8375e43ca2d - io_uring: consolidate hash_locked io-wq handling
## [2240] b21a51e26e9a - io_uring: clear REQ_F_HASH_LOCKED on hash removal
## [2239] ceff501790a9 - io_uring: don't race double poll setting REQ_F_ASYNC_DATA
## [2238] 7a121ced6e64 - io_uring: don't miss setting REQ_F_DOUBLE_POLL
## [2237] cf0dd9527eee - io_uring: disable multishot recvmsg
## [2236] e0486f3f7c1b - io_uring: only trace one of complete or overflow
## [2235] 9b26e811e934 - io_uring: fix io_uring_cqe_overflow trace format
## [2234] b3fdea6ecb55 - io_uring: multishot recv
## [2233] cbd25748545c - io_uring: fix multishot accept ordering
## [2232] a2da676376fe - io_uring: fix multishot poll on overflow
## [2231] 52120f0fadcb - io_uring: add allow_overflow to io_post_aux_cqe
## [2230] 114eccdf0e36 - io_uring: add IOU_STOP_MULTISHOT return code
## [2229] 2ba69707d915 - io_uring: clean up io_poll_check_events return values
## [2228] d4e097dae29c - io_uring: recycle buffers on error
## [2227] 5702196e7d9d - io_uring: allow iov_len = 0 for recvmsg and buffer select
## [2226] 32f3c434b142 - io_uring: restore bgid in io_put_kbuf
## [2225] b8c015598c8e - io_uring: allow 0 length for buffer select
## [2224] 6e73dffbb93c - io_uring: let to set a range for file slot allocation
## [2223] e6130eba8a84 - io_uring: add support for passing fixed file descriptors
## [2222] f110ed8498af - io_uring: split out fixed file installation and removal
## [2221] 8fcf4c48f44b - io_uring: replace zero-length array with flexible-array member
## [2220] fbb8bb029117 - io_uring: remove ctx->refs pinning on enter
## [2219] 3273c4407acd - io_uring: don't check file ops of registered rings
## [2218] ad8b261d8374 - io_uring: remove extra TIF_NOTIFY_SIGNAL check
## [2217] 3218e5d32dbc - io_uring: fuse fallback_node and normal tw node
## [2216] 37c7bd31b3e9 - io_uring: improve io_fail_links()
## [2215] fe991a7688f8 - io_uring: move POLLFREE handling to separate function
## [2214] 795bbbc8a9a1 - io_uring: kbuf: inline io_kbuf_recycle_ring()
## [2213] 49f1c68e048f - io_uring: optimise submission side poll_refs
## [2212] de08356f4858 - io_uring: refactor poll arm error handling
## [2211] 063a007996bf - io_uring: change arm poll return values
## [2210] 5204aa8c43bd - io_uring: add a helper for apoll alloc
## [2209] 13a99017ff19 - io_uring: remove events caching atavisms
## [2208] 0638cd7be212 - io_uring: clean poll ->private flagging
## [2207] 78a861b94959 - io_uring: add sync cancelation API through io_uring_register()
## [2206] 7d8ca7250197 - io_uring: add IORING_ASYNC_CANCEL_FD_FIXED cancel flag
## [2205] 88f52eaad2df - io_uring: have cancelation API accept io_uring_task directly
## [2204] 024b8fde3320 - io_uring: kbuf: kill __io_kbuf_recycle()
## [2203] c6dd763c2460 - io_uring: trace task_work_run
## [2202] eccd8801858f - io_uring: add trace event for running task work
## [2201] 3a0c037b0e16 - io_uring: batch task_work
## [2200] 923d159247b7 - io_uring: introduce llist helpers
## [2199] f88262e60bb9 - io_uring: lockless task list
## [2198] c34398a8c018 - io_uring: remove __io_req_task_work_add
## [2197] ed5ccb3beeba - io_uring: remove priority tw list optimisation
## [2196] 024f15e033a5 - io_uring: dedup io_run_task_work
## [2195] a6b21fbb4ce3 - io_uring: move list helpers to a separate file
## [2194] 625d38b3fd34 - io_uring: improve io_run_task_work()
## [2193] 4a0fef62788b - io_uring: optimize io_uring_task layout
## [2192] bce5d70cd64a - io_uring: add a warn_once for poll_find
## [2191] 9da070b14282 - io_uring: consistent naming for inline completion
## [2190] c059f7858408 - io_uring: move io_import_fixed()
## [2189] f337a84d3952 - io_uring: opcode independent fixed buf import
## [2188] 46929b086886 - io_uring: add io_commit_cqring_flush()
## [2187] 253993210bd8 - io_uring: introduce locking helpers for CQE posting
## [2186] 305bef988708 - io_uring: hide eventfd assumptions in eventfd paths
## [2185] b321823a03dc - io_uring: fix io_poll_remove_all clang warnings
## [2184] ba3cdb6fbb6e - io_uring: improve task exit timeout cancellations
## [2183] affa87db9010 - io_uring: fix multi ctx cancellation
## [2182] d9dee4302a7c - io_uring: remove ->flush_cqes optimisation
## [2181] a830ffd28780 - io_uring: move io_eventfd_signal()
## [2180] 9046c6415be6 - io_uring: reshuffle io_uring/io_uring.h
## [2179] d142c3ec8d16 - io_uring: remove extra io_commit_cqring()
## [2178] ad163a7e2562 - io_uring: move a few private types to local headers
## [2177] 48863ffd3e81 - io_uring: clean up tracing events
## [2176] ab1c84d855cf - io_uring: make io_uring_types.h public
## [2175] 27a9d66fec77 - io_uring: kill extra io_uring_types.h includes
## [2174] b3659a65be70 - io_uring: change ->cqe_cached invariant for CQE32
## [2173] e8c328c3913d - io_uring: deduplicate io_get_cqe() calls
## [2172] ae5735c69bf2 - io_uring: deduplicate __io_fill_cqe_req tracing
## [2171] 68494a65d0e2 - io_uring: introduce io_req_cqe_overflow()
## [2170] faf88dde060f - io_uring: don't inline __io_get_cqe()
## [2169] d245bca6375b - io_uring: don't expose io_fill_cqe_aux()
## [2168] f09c8643f0fa - io_uring: kbuf: add comments for some tricky code
## [2167] 9ca9fb24d5fe - io_uring: mutex locked poll hashing
## [2166] 5d7943d99df9 - io_uring: propagate locking state to poll cancel
## [2165] e6f89be61410 - io_uring: introduce a struct for hash table
## [2164] a2cdd5193218 - io_uring: pass hash table into poll_find
## [2163] 97bbdc06a444 - io_uring: add IORING_SETUP_SINGLE_ISSUER
## [2162] 0ec6dca22319 - io_uring: use state completion infra for poll reqs
## [2161] 8b1dfd343ae6 - io_uring: clean up io_ring_ctx_alloc
## [2160] 4a07723fb4bb - io_uring: limit the number of cancellation buckets
## [2159] 4dfab8abb472 - io_uring: clean up io_try_cancel
## [2158] 1ab1edb0a104 - io_uring: pass poll_find lock back
## [2157] 38513c464d3d - io_uring: switch cancel_hash to use per entry spinlock
## [2156] 3654ab0c51a9 - io_uring: poll: remove unnecessary req->ref set
## [2155] 53ccf69bda6f - io_uring: don't inline io_put_kbuf
## [2154] 7012c81593d5 - io_uring: refactor io_req_task_complete()
## [2153] 75d7b3aec13b - io_uring: kill REQ_F_COMPLETE_INLINE
## [2152] df9830d883b9 - io_uring: rw: delegate sync completions to core io_uring
## [2151] bb8f87003158 - io_uring: remove unused IO_REQ_CACHE_SIZE defined
## [2150] c65f5279ba02 - io_uring: don't set REQ_F_COMPLETE_INLINE in tw
## [2149] 3a08576b96e3 - io_uring: remove check_cq checking from hot paths
## [2148] aeaa72c69473 - io_uring: never defer-complete multi-apoll
## [2147] 6a02e4be8187 - io_uring: inline ->registered_rings
## [2146] 48c13d898084 - io_uring: explain io_wq_work::cancel_seq placement
## [2145] aa1e90f64ee5 - io_uring: move small helpers to headers
## [2144] 22eb2a3fdea0 - io_uring: refactor ctx slow data placement
## [2143] aff5b2df9e8b - io_uring: better caching for ctx timeout fields
## [2142] b25436038f6c - io_uring: move defer_list to slow data
## [2141] 5ff4fdffad48 - io_uring: make reg buf init consistent
## [2140] 61a2732af4b0 - io_uring: deprecate epoll_ctl support
## [2139] b9ba8a4463cd - io_uring: add support for level triggered poll
## [2138] d9b57aa3cfc7 - io_uring: move opcode table to opdef.c
## [2137] f3b44f92e59a - io_uring: move read/write related opcodes to its own file
## [2136] c98817e6cd44 - io_uring: move remaining file table manipulation to filetable.c
## [2135] 735729844819 - io_uring: move rsrc related data, core, and commands
## [2134] 3b77495a9723 - io_uring: split provided buffers handling into its own file
## [2133] 7aaff708a768 - io_uring: move cancelation into its own file
## [2132] 329061d3e2f9 - io_uring: move poll handling into its own file
## [2131] cfd22e6b3319 - io_uring: add opcode name to io_op_defs
## [2130] 92ac8beaea1f - io_uring: include and forward-declaration sanitation
## [2129] c9f06aa7de15 - io_uring: move io_uring_task (tctx) helpers into its own file
## [2128] a4ad4f748ea9 - io_uring: move fdinfo helpers to its own file
## [2127] e5550a1447bf - io_uring: use io_is_uring_fops() consistently
## [2126] 17437f311490 - io_uring: move SQPOLL related handling into its own file
## [2125] 59915143e89f - io_uring: move timeout opcodes and handling into its own file
## [2124] e418bbc97bff - io_uring: move our reference counting into a header
## [2123] 36404b09aa60 - io_uring: move msg_ring into its own file
## [2122] f9ead18c1058 - io_uring: split network related opcodes into its own file
## [2121] e0da14def1ee - io_uring: move statx handling to its own file
## [2120] a9c210cebe13 - io_uring: move epoll handler to its own file
## [2119] 4cf90495281b - io_uring: add a dummy -EOPNOTSUPP prep handler
## [2118] 99f15d8d6136 - io_uring: move uring_cmd handling to its own file
## [2117] cd40cae29ef8 - io_uring: split out open/close operations
## [2116] 453b329be5ea - io_uring: separate out file table handling code
## [2115] f4c163dd7d4b - io_uring: split out fadvise/madvise operations
## [2114] 0d5847274037 - io_uring: split out fs related sync/fallocate functions
## [2113] 531113bbd5bf - io_uring: split out splice related operations
## [2112] 11aeb71406dd - io_uring: split out filesystem related operations
## [2111] e28683bdfc2f - io_uring: move nop into its own file
## [2110] 5e2a18d93fec - io_uring: move xattr related opcodes to its own file
## [2109] 97b388d70b53 - io_uring: handle completions in the core
## [2108] de23077eda61 - io_uring: set completion results upfront
## [2107] e27f928ee1cb - io_uring: add io_uring_types.h
## [2106] 4d4c9cff4f70 - io_uring: define a request type cleanup handler
## [2105] 890968dc0336 - io_uring: unify struct io_symlink and io_hardlink
## [2104] 9a3a11f977f9 - io_uring: convert iouring_cmd to io_cmd_type
## [2103] ceb452e1b4ba - io_uring: convert xattr to use io_cmd_type
## [2102] ea5af87d29cf - io_uring: convert rsrc_update to io_cmd_type
## [2101] c1ee55950155 - io_uring: convert msg and nop to io_cmd_type
## [2100] 2511d3030c5e - io_uring: convert splice to use io_cmd_type
## [2099] 3e93a3571a17 - io_uring: convert epoll to io_cmd_type
## [2098] bb040a21fd05 - io_uring: convert file system request types to use io_cmd_type
## [2097] 37d4842f11c5 - io_uring: convert madvise/fadvise to use io_cmd_type
## [2096] dd752582e398 - io_uring: convert open/close path to use io_cmd_type
## [2095] a43714ace50d - io_uring: convert timeout path to use io_cmd_type
## [2094] f38987f09a06 - io_uring: convert cancel path to use io_cmd_type
## [2093] e4a71006eace - io_uring: convert the sync and fallocate paths to use io_cmd_type
## [2092] 8ff86d85b74d - io_uring: convert net related opcodes to use io_cmd_type
## [2091] bd8587e4997a - io_uring: remove recvmsg knowledge from io_arm_poll_handler()
## [2090] c24b154967b6 - io_uring: convert poll_update path to use io_cmd_type
## [2089] 8d4388d1166f - io_uring: convert poll path to use io_cmd_type
## [2088] 3c306fb2f946 - io_uring: convert read/write path to use io_cmd_type
## [2087] f49eca21563b - io_uring: add generic command payload type to struct io_kiocb
## [2086] dc919caff6b6 - io_uring: move req async preparation into opcode handler
## [2085] ed29b0b4fd83 - io_uring: move to separate directory
## [2084] 0702e5364f64 - io_uring: define a 'prep' and 'issue' handler for each opcode
## [2083] e94eb459d3e4 - ublk_drv: fix lockdep warning
## [2082] 934447a603b2 - io_uring: do not recycle buffer in READV
## [2081] ec8516f3b7c4 - io_uring: fix free of unallocated buffer list
## [2080] 753f1ca4e1e5 - net: introduce managed frags infrastructure
## [2079] 7c701d92b2b5 - skbuff: carry external ubuf_info in msghdr
## [2078] cebbe577cb17 - ublk_drv: fix request queue leak
## [2077] 0edb3696c171 - ublk_drv: support to complete io command via task_work_add
## [2076] 71f28f3136af - ublk_drv: add io_uring based userspace block driver
## [2075] d785a773bed9 - io_uring: check that we have a file table when allocating update slots
## [2074] a4527e1853f8 - btrfs: return -EAGAIN for NOWAIT dio reads/writes on compressed and inline extents
## [2073] bdb2c48e4b38 - io_uring: explicit sqe padding for ioctl commands
## [2072] 09007af2b627 - io_uring: fix provided buffer import
## [2071] 29c1ac230e60 - io_uring: keep sendrecv flags in ioprio
## [2070] a78418e6a04c - block: Always initialize bio IO priority on submit
## [2069] 386e4fb6962b - io_uring: use original request task for inflight tracking
## [2068] e70b64a3f28b - io_uring: move io_uring_get_opcode out of TP_printk
## [2067] c0737fa9a5a5 - io_uring: fix double poll leak on repolling
## [2066] 9d2ad2947a53 - io_uring: fix wrong arm_poll error handling
## [2065] c487a5ad4883 - io_uring: fail links when poll fails
## [2064] aacf2f9f382c - io_uring: fix req->apoll_events
## [2063] b60cac14bb3c - io_uring: fix merge error in checking send/recv addr2 flags
## [2062] 1bacd264d3c3 - io_uring: mark reissue requests with REQ_F_PARTIAL_IO
## [2061] 6436c770f120 - io_uring: recycle provided buffer if we punt to io-wq
## [2060] 32fc810b364f - io_uring: do not use prio task_work_add in uring_cmd
## [2059] a76c0b31eef5 - io_uring: commit non-pollable provided mapped buffers upfront
## [2058] c5595975b53a - io_uring: make io_fill_cqe_aux honour CQE32
## [2057] cd94903d3ba5 - io_uring: remove __io_fill_cqe() helper
## [2056] 2caf9822f050 - io_uring: fix ->extra{1,2} misuse
## [2055] 29ede2014c87 - io_uring: fill extra big cqe fields from req
## [2054] f43de1f88841 - io_uring: unite fill_cqe and the 32B version
## [2053] 91ef75a7db0d - io_uring: get rid of __io_fill_cqe{32}_req()
## [2052] d884b6498d2f - io_uring: remove IORING_CLOSE_FD_AND_FILE_SLOT
## [2051] aa165d6d2bb5 - Revert "io_uring: add buffer selection support to IORING_OP_NOP"
## [2050] 8899ce4b2f73 - Revert "io_uring: support CQE32 for nop operation"
## [2049] f9437ac0f851 - io_uring: limit size of provided buffer ring
## [2048] c6e9fa5c0ab8 - io_uring: fix types in provided buffer ring
## [2047] 97da4a537924 - io_uring: fix index calculation
## [2046] fc9375e3f763 - io_uring: fix double unlock for pbuf select
## [2045] 42db0c00e275 - io_uring: kbuf: fix bug of not consuming ring buffer in partial io case
## [2044] e71d7c56dd69 - io_uring: openclose: fix bug of closing wrong fixed file
## [2043] 05b538c1765f - io_uring: fix not locked access to fixed buf table
## [2042] d11d31fc5d8a - io_uring: fix races with buffer table unregister
## [2041] b0380bf6dad4 - io_uring: fix races with file table unregister
## [2040] 9cae36a094e7 - io_uring: reinstate the inflight tracking
## [2039] 61c1b44a21d7 - io_uring: fix deadlock on iowq file slot alloc
## [2038] 0e9911fa768f - virtio-blk: support mq_ops->queue_rqs()
## [2037] 4e0400525691 - virtio-blk: support polling I/O
## [2036] a7c41b4687f5 - io_uring: let IORING_OP_FILES_UPDATE support choosing fixed file slots
## [2035] 4278a0deb1f6 - io_uring: defer alloc_hint update to io_file_bitmap_set()
## [2034] 8c71fe750215 - io_uring: ensure fput() called correspondingly when direct install fails
## [2033] fa82dd105bed - io_uring: wire up allocated direct descriptors for socket
## [2032] 21870e02fcd3 - io_uring: fix a memory leak of buffer group list on exit
## [2031] 1151a7cccbd2 - io_uring: move shutdown under the general net section
## [2030] 157dc813b47a - io_uring: unify calling convention for async prep handling
## [2029] fcde59feb1af - io_uring: add io_op_defs 'def' pointer in req init and issue
## [2028] 54739cc6b4e1 - io_uring: make prep and issue side of req handlers named consistently
## [2027] ecddc25d1355 - io_uring: make timeout prep handlers consistent with other prep handlers
## [2026] 3fe07bcd800d - io_uring: cleanup handling of the two task_work lists
## [2025] 0e7579ca732a - io_uring: fix incorrect __kernel_rwf_t cast
## [2024] 2fcabce2d7d3 - io_uring: disallow mixed provided buffer group registrations
## [2023] 1d0dbbfa282d - io_uring: initialize io_buffer_list head when shared ring is unregistered
## [2022] 0184f08e6534 - io_uring: add fully sparse buffer registration
## [2021] 0bf1dbee9baf - io_uring: use rcu_dereference in io_close
## [2020] a294bef57c55 - io_uring: consistently use the EPOLL* defines
## [2019] 58f5c8d39e0e - io_uring: make apoll_events a __poll_t
## [2018] ee67ba3b20f7 - io_uring: drop a spurious inline on a forward declaration
## [2017] 984824db844a - io_uring: don't use ERR_PTR for user pointers
## [2016] 20cbd21d899b - io_uring: use a rwf_t for io_rw.flags
## [2015] c7fb19428d67 - io_uring: add support for ring mapped supplied buffers
## [2014] d8c2237d0aa9 - io_uring: add io_pin_pages() helper
## [2013] 3d200242a6c9 - io_uring: add buffer selection support to IORING_OP_NOP
## [2012] e7637a492b9f - io_uring: fix locking state for empty buffer group
## [2011] 69e9cd66ae13 - audit,io_uring,io-wq: call __audit_uring_exit for dummy contexts
## [2010] aa184e8671f0 - io_uring: don't attempt to IOPOLL for MSG_RING requests
## [2009] 2306e83e730a - btrfs: avoid double search for block group during NOCOW writes
## [2008] d4135134ab8f - btrfs: avoid blocking on space revervation when doing nowait dio writes
## [2007] 81132a39c152 - fs: remove fget_many and fput_many interface
## [2006] 4e86a2c98013 - io_uring: implement multishot mode for accept
## [2005] dbc2564cfe0f - io_uring: let fast poll support multishot
## [2004] 227685ebfaba - io_uring: add REQ_F_APOLL_MULTISHOT for requests
## [2003] 390ed29b5e42 - io_uring: add IORING_ACCEPT_MULTISHOT for accept
## [2002] 1b1d7b4bf1d9 - io_uring: only wake when the correct events are set
## [2001] e0deb6a025ae - io_uring: avoid io-wq -EAGAIN looping for !IOPOLL
## [2000] a8da73a32b6e - io_uring: add flag for allocating a fully sparse direct descriptor space
## [1999] 09893e15f1e9 - io_uring: bump max direct descriptor count to 1M
## [1998] c30c3e00cbd9 - io_uring: allow allocated fixed files for accept
## [1997] 1339f24b336d - io_uring: allow allocated fixed files for openat/openat2
## [1996] b70b8e3331d8 - io_uring: add basic fixed file allocator
## [1995] d78bd8adfcbc - io_uring: track fixed files with a bitmap
## [1994] 4329490a78b6 - io_uring_enter(): don't leave f.flags uninitialized
## [1993] 2d2d5cb6ca84 - io_uring: fix ordering of args in io_uring_queue_async_work
## [1992] ee692a21e9bf - fs,io_uring: add infrastructure for uring-cmd
## [1991] 322842ea3c72 - mm/rmap: fix missing swap_free() in try_to_unmap() after arch_unmap_one() failed
## [1990] 2bb04df7c2af - io_uring: support CQE32 for nop operation
## [1989] 76c68fbf1a1f - io_uring: enable CQE32
## [1988] f9b3dfcc68a5 - io_uring: support CQE32 in /proc info
## [1987] c4bb964fa092 - io_uring: add tracing for additional CQE32 fields
## [1986] e45a3e05008d - io_uring: overflow processing for CQE32
## [1985] 0e2e5c47fed6 - io_uring: flush completions for CQE32
## [1984] 2fee6bc64078 - io_uring: modify io_get_cqe for CQE32
## [1983] effcf8bdeb03 - io_uring: add CQE32 completion processing
## [1982] 916587984fac - io_uring: add CQE32 setup processing
## [1981] baf9cb643b48 - io_uring: change ring size calculation for CQE32
## [1980] 4e5bc0a9a1d0 - io_uring: store add. return values for CQE32
## [1979] 7a51e5b44b92 - io_uring: support CQE32 in io_uring_cqe
## [1978] ebdeb7c01d02 - io_uring: add support for 128-byte SQEs
## [1977] 7ccba24d3bc0 - io_uring: don't clear req->kbuf when buffer selection is done
## [1976] 1dbd023eb083 - io_uring: eliminate the need to track provided buffer ID separately
## [1975] 660cbfa2340a - io_uring: move provided buffer state closer to submit state
## [1974] a4f8d94cfb7c - io_uring: move provided and fixed buffers into the same io_kiocb area
## [1973] 149c69b04a90 - io_uring: abstract out provided buffer list selection
## [1972] b66e65f41426 - io_uring: never call io_buffer_select() for a buffer re-select
## [1971] 9cfc7e94e42b - io_uring: get rid of hashed provided buffer groups
## [1970] 4e9067025259 - io_uring: always use req->buf_index for the provided buffer group
## [1969] bb68d504f7c4 - io_uring: ignore ->buf_index if REQ_F_BUFFER_SELECT isn't set
## [1968] e5b003495e93 - io_uring: kill io_rw_buffer_select() wrapper
## [1967] c54d52c2d613 - io_uring: make io_buffer_select() return the user address directly
## [1966] c5febea0956f - fork: Pass struct kernel_clone_args into copy_thread
## [1965] 9396ed850f2e - io_uring: kill io_recv_buffer_select() wrapper
## [1964] 0a352aaa9473 - io_uring: use 'sr' vs 'req->sr_msg' consistently
## [1963] 0455d4ccec54 - io_uring: add POLL_FIRST support for send/sendmsg and recv/recvmsg
## [1962] 73911426aaaa - io_uring: check IOPOLL/ioprio support upfront
## [1961] c29722fad4aa - selinux: log anon inode class name
## [1960] 9650b453a3d4 - block: ignore RWF_HIPRI hint for sync dio
## [1959] a196c78b5443 - io_uring: assign non-fixed early for async work
## [1958] f2e030dd7aae - io_uring: replace smp_mb() with smp_mb__after_atomic() in io_sq_thread()
## [1957] ef060ea9e4fd - io_uring: add IORING_SETUP_TASKRUN_FLAG
## [1956] e1169f06d5bb - io_uring: use TWA_SIGNAL_NO_IPI if IORING_SETUP_COOP_TASKRUN is used
## [1955] 9f010507bbc1 - io_uring: set task_work notify method at init time
## [1954] 3a4b89a25ce5 - io_uring: serialize ctx->rings->sq_flags with atomic_or/and
## [1953] f548a12efd5a - io_uring: return hint on whether more data is available after receive
## [1952] 303cc749c865 - io_uring: check that data field is 0 in ringfd unregister
## [1951] 033b87d24f72 - io_uring: use the text representation of ops in trace
## [1950] 32452a3eb8b6 - io_uring: fix uninitialized field in rw io_kiocb
## [1949] 5a1e99b61b0c - io_uring: check reserved fields for recv/recvmsg
## [1948] 588faa1ea5ee - io_uring: check reserved fields for send/sendmsg
## [1947] 1460af7de6ab - io_uring: rename op -> opcode
## [1946] 33337d03f04f - io_uring: add io_uring_get_opcode
## [1945] cc51eaa8b530 - io_uring: add type to op enum
## [1944] 69cc1b6fa565 - io_uring: fix compile warning for 32-bit builds
## [1943] 4ffaa94b9c04 - io_uring: cleanup error-handling around io_req_complete
## [1942] 1374e08e2d44 - io_uring: add socket(2) support
## [1941] da214a475f8b - net: add __sys_socket_file()
## [1940] 0200ce6a57c5 - io_uring: fix trace for reduced sqe padding
## [1939] a56834e0fafe - io_uring: add fgetxattr and getxattr support
## [1938] e9621e2bec80 - io_uring: add fsetxattr and setxattr support
## [1937] c975cad93157 - fs: split off do_getxattr from getxattr
## [1936] 1a91794ce848 - fs: split off setxattr_copy and do_setxattr function from setxattr
## [1935] 155bc9505dbd - io_uring: return an error when cqe is dropped
## [1934] 10988a0a67ba - io_uring: use constants for cq_overflow bitfield
## [1933] 3e813c902672 - io_uring: rework io_uring_enter to simplify return value
## [1932] 08dcd0288f6e - io_uring: trace cqe overflows
## [1931] 47894438e916 - io_uring: add trace support for CQE overflow
## [1930] 10c873334feb - io_uring: allow re-poll if we made progress
## [1929] 4c3c09439c08 - io_uring: support MSG_WAITALL for IORING_OP_SEND(MSG)
## [1928] 970f256edb8c - io_uring: add support for IORING_ASYNC_CANCEL_ANY
## [1927] 4bf94615b888 - io_uring: allow IORING_OP_ASYNC_CANCEL with 'fd' key
## [1926] 8e29da69fead - io_uring: add support for IORING_ASYNC_CANCEL_ALL
## [1925] b21432b4d580 - io_uring: pass in struct io_cancel_data consistently
## [1924] 98d3dcc8be97 - io_uring: remove dead 'poll_only' argument to io_poll_cancel()
## [1923] 81ec803b4ecd - io_uring: refactor io_disarm_next() locking
## [1922] 3645c2000a76 - io_uring: move timeout locking in io_timeout_cancel()
## [1921] 5e45690a1cb8 - io_uring: store SCM state in io_fixed_file->file_ptr
## [1920] 7ac1edc4a9bb - io_uring: kill ctx arg from io_req_put_rsrc
## [1919] 25a15d3c668b - io_uring: add a helper for putting rsrc nodes
## [1918] c1bdf8ed1e84 - io_uring: store rsrc node in req instead of refs
## [1917] 772f5e002b9e - io_uring: refactor io_assign_file error path
## [1916] 93f052cb39e1 - io_uring: use right helpers for file assign locking
## [1915] a6d97a8a77cb - io_uring: add data_race annotations
## [1914] 17b147f6c1f2 - io_uring: inline io_req_complete_fail_submit()
## [1913] 924a07e482ba - io_uring: refactor io_submit_sqe()
## [1912] df3becde8d9d - io_uring: refactor lazy link fail
## [1911] da1a08c5b281 - io_uring: introduce IO_REQ_LINK_FLAGS
## [1910] 7bfa9badc793 - io_uring: refactor io_queue_sqe()
## [1909] 77955efbc462 - io_uring: rename io_queue_async_work()
## [1908] cbc2e2038845 - io_uring: inline io_queue_sqe()
## [1907] cb2d344c7551 - io_uring: helper for prep+queuing linked timeouts
## [1906] f5c6cf2a310d - io_uring: inline io_free_req()
## [1905] 4e118cd9e9e6 - io_uring: kill io_put_req_deferred()
## [1904] 971cf9c19e97 - io_uring: minor refactoring for some tw handlers
## [1903] f22190570b21 - io_uring: clean poll tw PF_EXITING handling
## [1902] d8da428b7a9a - io_uring: optimise io_get_cqe()
## [1901] 1cd15904b6e8 - io_uring: optimise submission left counting
## [1900] 8e6971a819df - io_uring: optimise submission loop invariant
## [1899] fa05457a603e - io_uring: add helper to return req to cache list
## [1898] 88ab95be7e40 - io_uring: helper for empty req cache checks
## [1897] 23a5c43b2fc0 - io_uring: inline io_flush_cached_reqs
## [1896] e126391c0920 - io_uring: shrink final link flush
## [1895] 90e7c35fb891 - io_uring: memcpy CQE from req
## [1894] cef216fc32d7 - io_uring: explicitly keep a CQE in io_kiocb
## [1893] 8b3171bdf53c - io_uring: rename io_sqe_file_register
## [1892] 73b25d3badbf - io_uring: deduplicate SCM accounting
## [1891] e390510af046 - io_uring: don't pass around fixed index for scm
## [1890] dca58c6a08a9 - io_uring: refactor __io_sqe_files_scm
## [1889] a03a2a209e82 - io_uring: uniform SCM accounting
## [1888] 1f59bc0f18cf - io_uring: don't scm-account for non af_unix sockets
## [1887] b4f20bb4e6d5 - io_uring: move finish_wait() outside of loop in cqring_wait()
## [1886] 775a1f2f9948 - io_uring: refactor io_req_add_compl_list()
## [1885] 963c6abbb4e4 - io_uring: silence io_for_each_link() warning
## [1884] 9d170164dbac - io_uring: partially uninline io_put_task()
## [1883] f89296305145 - io_uring: cleanup conditional submit locking
## [1882] d487b43cd327 - io_uring: optimise mutex locking for submit+iopoll
## [1881] 773697b610bf - io_uring: pre-calculate syscall iopolling decision
## [1880] f81440d33cc6 - io_uring: split off IOPOLL argument verifiction
## [1879] 57859f4d93db - io_uring: clean up io_queue_next()
## [1878] b605a7fabb60 - io_uring: move poll recycling later in compl flushing
## [1877] a538be5be328 - io_uring: optimise io_free_batch_list
## [1876] 7819a1f6ac03 - io_uring: refactor io_req_find_next
## [1875] 60053be859b3 - io_uring: remove extra ifs around io_commit_cqring
## [1874] 68ca8fc00277 - io_uring: small optimisation of tctx_task_work
## [1873] c0713540f6d5 - io_uring: fix leaks on IOPOLL and CQE_SKIP
## [1872] 323b190ba2de - io_uring: free iovec if file assignment fails
## [1871] 701521403cfb - io_uring: abort file assignment prior to assigning creds
## [1870] 7179c3ce3dbf - io_uring: fix poll error reporting
## [1869] cce64ef01308 - io_uring: fix poll file assign deadlock
## [1868] e941976659f1 - io_uring: use right issue_flags for splice/tee
## [1867] d2347b9695da - io_uring: verify pad field is 0 in io_get_ext_arg
## [1866] 6fb53cf8ff2c - io_uring: verify resv is 0 in ringfd register/unregister
## [1865] d8a3ba9c143b - io_uring: verify that resv2 is 0 in io_uring_rsrc_update2
## [1864] 565c5e616e80 - io_uring: move io_uring_rsrc_update2 validation
## [1863] 0f8da75b51ac - io_uring: fix assign file locking issue
## [1862] 82733d168cbd - io_uring: stop using io_wq_work as an fd placeholder
## [1861] 2804ecd8d3e3 - io_uring: move apoll->events cache
## [1860] 6f83ab22adcb - io_uring: io_kiocb_update_pos() should not touch file for non -1 offset
## [1859] c4212f3eb89f - io_uring: flag the fact that linked file assignment is sane
## [1858] e677edbcabee - io_uring: fix race between timeout flush and removal
## [1857] 4cdd158be9d0 - io_uring: use nospec annotation for more indexes
## [1856] 8f0a24801bb4 - io_uring: zero tag on rsrc removal
## [1855] a07211e30014 - io_uring: don't touch scm_fp_list after queueing skb
## [1854] 34bb77184123 - io_uring: nospec index for tags on files update
## [1853] 0f5e4b83b37a - io_uring: implement compat handling for IORING_REGISTER_IOWQ_AFF
## [1852] cb3182167325 - Revert "io_uring: Add support for napi_busy_poll"
## [1851] d5361233e9ab - io_uring: drop the old style inflight file tracking
## [1850] 6bf9c47a3989 - io_uring: defer file assignment
## [1849] 5106dd6e74ab - io_uring: propagate issue_flags state down to file assignment
## [1848] 584b0180f0f4 - io_uring: move read/write file prep state into actual opcode handler
## [1847] a3e4bc23d547 - io_uring: defer splice/tee file validity check until command issue
## [1846] ec858afda857 - io_uring: don't check req->file in io_fsync_prep()
## [1845] 5291984004ed - dm: fix bio polling to handle possibile BLK_STS_AGAIN
## [1844] 3f1d52abf098 - io_uring: defer msg-ring file validity check until command issue
## [1843] 9666d4206e9a - io_uring: fail links if msg-ring doesn't succeeed
## [1842] c86d18f4aa93 - io_uring: fix memory leak of uid in files registration
## [1841] 8197b053a833 - io_uring: fix put_kbuf without proper locking
## [1840] ab0ac0959b02 - io_uring: fix invalid flags for io_put_kbuf()
## [1839] 41cdcc2202d4 - io_uring: improve req fields comments
## [1838] 52dd86406dfa - io_uring: enable EPOLLEXCLUSIVE for accept poll
## [1837] 34d2bfe7d4b6 - io_uring: improve task work cache utilization
## [1836] a73825ba70c9 - io_uring: fix async accept on O_NONBLOCK sockets
## [1835] 7ef66d186eb9 - io_uring: remove IORING_CQE_F_MSG
## [1834] 8a3e8ee56417 - io_uring: add flag for disabling provided buffer recycling
## [1833] 7ba89d2af17a - io_uring: ensure recv and recvmsg handle MSG_WAITALL correctly
## [1832] 4d55f238f8b8 - io_uring: don't recycle provided buffer if punted to async worker
## [1831] d89a4fac0fbc - io_uring: fix assuming triggered poll waitqueue is the single poll
## [1830] e2c0cb7c0cc7 - io_uring: bump poll refs to full 31-bits
## [1829] a8c49af3be5f - memcg: add per-memcg total kernel memory stat
## [1828] 61bc84c40088 - io_uring: remove poll entry from list when canceling all
## [1827] 649bb75d19c9 - io_uring: fix memory ordering when SQPOLL thread goes to sleep
## [1826] f63cf5192fe3 - io_uring: ensure that fsnotify is always called
## [1825] abdad709ed8f - io_uring: recycle provided before arming poll
## [1824] 5e929367468c - io_uring: terminate manual loop iterator loop correctly for non-vecs
## [1823] adf3a9e9f556 - io_uring: don't check unrelated req->open.how in accept request
## [1822] dbc7d452e7cf - io_uring: manage provided buffers strictly ordered
## [1821] 9aa8dfde4869 - io_uring: fold evfd signalling under a slower path
## [1820] 9333f6b4628c - io_uring: thin down io_commit_cqring()
## [1819] 66fc25ca6b7e - io_uring: shuffle io_eventfd_signal() bits around
## [1818] 0f84747177b9 - io_uring: remove extra barrier for non-sqpoll iopoll
## [1817] b91ef1872869 - io_uring: fix provided buffer return on failure for kiocb_done()
## [1816] 3b2b78a8eb7c - io_uring: extend provided buf return to fails
## [1815] 6695490dc857 - io_uring: refactor timeout cancellation cqe posting
## [1814] ae4da18941c1 - io_uring: normilise naming for fill_cqe*
## [1813] 91eac1c69c20 - io_uring: cache poll/double-poll state with a request flag
## [1812] 81459350d581 - io_uring: cache req->apoll->events in req->cflags
## [1811] 521d61fc760a - io_uring: move req->poll_refs into previous struct hole
## [1810] 052ebf1fbb1c - io_uring: make tracing format consistent
## [1809] 4d9237e32c5d - io_uring: recycle apoll_poll entries
## [1808] f3b6a41eb2bb - io_uring: remove duplicated member check for io_msg_ring_prep()
## [1807] bcbb7bf6ccde - io_uring: allow submissions to continue on error
## [1806] b1c62645758e - io_uring: recycle provided buffers if request goes async
## [1805] 2be2eb02e2f5 - io_uring: ensure reads re-import for selected buffers
## [1804] 9af177ee3ef1 - io_uring: retry early for reads if we can poll
## [1803] adc8682ec690 - io_uring: Add support for napi_busy_poll
## [1802] 950e79dd7313 - io_uring: minor io_cqring_wait() optimization
## [1801] 4f57f06ce218 - io_uring: add support for IORING_OP_MSG_RING command
## [1800] cc3cec8367cb - io_uring: speedup provided buffer handling
## [1799] e7a6c00dc77a - io_uring: add support for registering ring file descriptors
## [1798] 63c36549737e - io_uring: documentation fixup
## [1797] b4aec4001595 - io_uring: do not recalculate ppos unnecessarily
## [1796] d34e1e5b396a - io_uring: update kiocb->ki_pos at execution time
## [1795] af9c45ecebaf - io_uring: remove duplicated calls to io_kiocb_ppos
## [1794] c5020bc8d929 - io_uring: Remove unneeded test in io_run_task_work_sig()
## [1793] d5ec1dfaf59b - io-uring: add __fill_cqe function
## [1792] 42abc95f05bf - io-wq: decouple work_list protection from the big wqe->lock
## [1791] f0a4e62bb534 - io_uring: Fix use of uninitialized ret in io_eventfd_register()
## [1790] 8bb649ee1da3 - io_uring: remove ring quiesce for io_uring_register
## [1789] ff16cfcfdaaf - io_uring: avoid ring quiesce while registering restrictions and enabling rings
## [1788] c75312dd592b - io_uring: avoid ring quiesce while registering async eventfd
## [1787] 77bc59b49817 - io_uring: avoid ring quiesce while registering/unregistering eventfd
## [1786] 2757be22c0f4 - io_uring: remove trace for eventfd
## [1785] ca93e44bfb5f - btrfs: fallback to blocking mode when doing async dio over multiple extents
## [1784] 115dcec65f61 - vfio: Define device migration protocol v2
## [1783] 80912cef18f1 - io_uring: disallow modification of rsrc_data during quiesce
## [1782] 228339662b39 - io_uring: don't convert to jiffies for waiting on timeouts
## [1781] f240762f88b4 - io_uring: add a schedule point in io_add_buffers()
## [1780] 0a3f1e0beacf - mm: io_uring: allow oom-killer from io_uring_setup
## [1779] 0d7c1153d929 - io_uring: Clean up a false-positive warning from GCC 9.3.0
## [1778] aea0b9f2486d - landlock: Use square brackets around "landlock-ruleset"
## [1777] f6133fbd3738 - io_uring: remove unused argument from io_rsrc_node_alloc
## [1776] b36a2050040b - io_uring: fix bug in slow unregistering of nodes
## [1775] ccbf726171b7 - io_uring: perform poll removal even if async work removal is successful
## [1774] 791f3465c4af - io_uring: fix UAF due to missing POLLFREE handling
## [1773] c84b8a3fef66 - io_uring: Remove unused function req_ref_put
## [1772] 3cc7fdb9f90a - io_uring: fix not released cached task refs
## [1771] f51d46d0e7cb - md: add support for REQ_NOWAIT
## [1770] c0235652ee51 - io_uring: remove redundant tab space
## [1769] 00f6e68b8d59 - io_uring: remove unused function parameter
## [1768] cc8e9ba71a86 - io_uring: use completion batching for poll rem/upd
## [1767] eb0089d629ba - io_uring: single shot poll removal optimisation
## [1766] aa43477b0402 - io_uring: poll rework
## [1765] ab1dab960b83 - io_uring: kill poll linking optimisation
## [1764] 5641897a5e8f - io_uring: move common poll bits
## [1763] 2bbb146d96f4 - io_uring: refactor poll update
## [1762] e840b4baf3cf - io_uring: remove double poll on poll update
## [1761] afd3a5793fe2 - scsi: mpi3mr: Add io_uring interface support in I/O-polled mode
## [1760] 7b9762a5e883 - io_uring: zero iocb->ki_pos for stream file types
## [1759] 33ce2aff7d34 - io_uring: code clean for some ctx usage
## [1758] d800c65c2d4e - io-wq: drop wqe lock before creating new worker
## [1757] 78a780602075 - io_uring: ensure task_work gets run as part of cancelations
## [1756] 42288cb44c4b - wait: add wake_up_pollfree()
## [1755] f28c240e7152 - io_uring: batch completion in prior_task_list
## [1754] a37fae8aaa62 - io_uring: split io_req_complete_post() and add a helper
## [1753] 9f8d032a364b - io_uring: add helper for task work execution code
## [1752] 4813c3779261 - io_uring: add a priority tw list for irq completion work
## [1751] eaab9b573054 - scsi: ufs: Implement polling support
## [1750] a90c8bf65906 - io_uring: reuse io_req_task_complete for timeouts
## [1749] 83a13a4181b0 - io_uring: tweak iopoll CQE_SKIP event counting
## [1748] d1fd1c201d75 - io_uring: simplify selected buf handling
## [1747] 3648e5265cfa - io_uring: move up io_put_kbuf() and io_put_rw_kbuf()
## [1746] 0a467d0fdd95 - block: switch to atomic_t for request references
## [1745] 2385ebf38f94 - block: null_blk: batched complete poll requests
## [1744] 2087009c74d4 - io_uring: validate timespec for timeout removals
## [1743] f6223ff79966 - io_uring: Fix undefined-behaviour in io_issue_sqe
## [1742] 1d0254e6b47e - io_uring: fix soft lockup when call __io_remove_buffers
## [1741] 6af3f48bf615 - io_uring: fix link traversal locking
## [1740] 617a89484deb - io_uring: fail cancellation for EXITING tasks
## [1739] b6c7db321832 - io_uring: better to use REQ_F_IO_DRAIN for req->flags
## [1738] e302f1046f4c - io_uring: fix no lock protection for ctx->cq_extra
## [1737] 5562a8d71aa3 - io_uring: disable drain with cqe skip
## [1736] 3d4aeb9f9805 - io_uring: don't spinlock when not posting CQEs
## [1735] 04c76b41ca97 - io_uring: add option to skip CQE posting
## [1734] 913a571affed - io_uring: clean cqe filling functions
## [1733] 2ea537ca02b1 - io_uring: improve argument types of kiocb_done()
## [1732] f3251183b298 - io_uring: clean __io_import_iovec()
## [1731] 7297ce3d5944 - io_uring: improve send/recv error handling
## [1730] 06bdea20c107 - io_uring: simplify reissue in kiocb_done
## [1729] 674ee8e1b4a4 - io_uring: correct link-list traversal locking
## [1728] f6f9b278f205 - io_uring: fix missed comment from *task_file rename
## [1727] bad119b9a000 - io_uring: honour zeroes as io-wq worker limits
## [1726] a19577808fd3 - io_uring: remove dead 'sqe' store
## [1725] 83956c86fffe - io_uring: remove redundant assignment to ret in io_register_iowq_max_workers()
## [1724] 9881024aab80 - io_uring: clean up io_queue_sqe_arm_apoll
## [1723] f75d118349be - io_uring: harder fdinfo sq/cq ring iterating
## [1722] 3884b83dff24 - io_uring: don't assign write hint in the read path
## [1721] fb27274a90ea - io_uring: clusterise ki_flags access in rw_prep
## [1720] b9a6b8f92f6f - io_uring: kill unused param from io_file_supports_nowait
## [1719] d6a644a79545 - io_uring: clean up timeout async_data allocation
## [1718] afb7f56fc624 - io_uring: don't try io-wq polling if not supported
## [1717] 658d0a401637 - io_uring: check if opcode needs poll first on arming
## [1716] d01905db14eb - io_uring: clean iowq submit work cancellation
## [1715] 255657d23704 - io_uring: clean io_wq_submit_work()'s main loop
## [1714] 90fa02883f06 - io_uring: implement async hybrid mode for pollable requests
## [1713] b22fa62a35d7 - io_uring: apply worker limits to previous users
## [1712] e94f68527a35 - block: kill extra rcu lock/unlock in queue enter
## [1711] 4ea672ab694c - io_uring: fix ltimeout unprep
## [1710] e139a1ec92f8 - io_uring: apply max_workers limit to all future users
## [1709] 898df2447b9e - io_uring: Use ERR_CAST() instead of ERR_PTR(PTR_ERR())
## [1708] 3b44b3712c5b - io_uring: split logic of force_nonblock
## [1707] a9a7e30fd918 - nvme: don't memset() the normal read/write command
## [1706] 00169246e698 - io_uring: warning about unused-but-set parameter
## [1705] 5ca7a8b3f698 - io_uring: inform block layer of how many requests we are submitting
## [1704] 88459b50b42a - io_uring: simplify io_file_supports_nowait()
## [1703] 35645ac3c185 - io_uring: combine REQ_F_NOWAIT_{READ,WRITE} flags
## [1702] e74ead135bc4 - io_uring: arm poll for non-nowait files
## [1701] b10841c98c89 - fs/io_uring: Prioritise checking faster conditions first in io_write
## [1700] 5cb03d63420b - io_uring: clean io_prep_rw()
## [1699] 578c0ee234e5 - io_uring: optimise fixed rw rsrc node setting
## [1698] caa8fe6e86fd - io_uring: return iovec from __io_import_iovec
## [1697] d1d681b0846a - io_uring: optimise io_import_iovec fixed path
## [1696] 9882131cd9de - io_uring: kill io_wq_current_is_worker() in iopoll
## [1695] 9983028e7660 - io_uring: optimise req->ctx reloads
## [1694] 607b6fb8017a - io_uring: rearrange io_read()/write()
## [1693] 5e49c973fc39 - io_uring: clean up io_import_iovec
## [1692] 51aac424aef9 - io_uring: optimise io_import_iovec nonblock passing
## [1691] c88598a92a58 - io_uring: optimise read/write iov state storing
## [1690] 538941e2681c - io_uring: encapsulate rw state
## [1689] 258f3a7f84d1 - io_uring: optimise rw comletion handlers
## [1688] f80a50a632d6 - io_uring: prioritise read success path over fails
## [1687] 04f34081c5de - io_uring: consistent typing for issue_flags
## [1686] ab4094024784 - io_uring: optimise rsrc referencing
## [1685] a46be971edb6 - io_uring: optimise io_req_set_rsrc_node()
## [1684] def77acf4396 - io_uring: fix io_free_batch_list races
## [1683] 0cd3e3ddb4f6 - io_uring: remove extra io_ring_exit_work wake up
## [1682] 4a04d1d14831 - io_uring: optimise out req->opcode reloading
## [1681] 5a158c6b0d03 - io_uring: reshuffle io_submit_state bits
## [1680] 756ab7c0ec71 - io_uring: safer fallback_work free
## [1679] 6d63416dc57e - io_uring: optimise plugging
## [1678] 54daa9b2d80a - io_uring: correct fill events helpers types
## [1677] eb6e6f0690c8 - io_uring: inline io_poll_complete
## [1676] 867f8fa5aeb7 - io_uring: inline io_req_needs_clean()
## [1675] d17e56eb4907 - io_uring: remove struct io_completion
## [1674] d886e185a128 - io_uring: control ->async_data with a REQ_F flag
## [1673] c1e53a6988b9 - io_uring: optimise io_free_batch_list()
## [1672] c072481ded14 - io_uring: mark cold functions
## [1671] 37f0e767e177 - io_uring: optimise ctx referencing by requests
## [1670] d60aa65ba221 - io_uring: merge CQ and poll waitqueues
## [1669] aede728aae35 - io_uring: don't wake sqpoll in io_cqring_ev_posted
## [1668] 765ff496c781 - io_uring: optimise INIT_WQ_LIST
## [1667] a33ae9ce16a8 - io_uring: optimise request allocation
## [1666] fff4e40e3094 - io_uring: delay req queueing into compl-batch list
## [1665] 51d48dab62ed - io_uring: add more likely/unlikely() annotations
## [1664] 7e3709d57651 - io_uring: optimise kiocb layout
## [1663] 6224590d242f - io_uring: add flag to not fail link after timeout
## [1662] 30d51dd4ad20 - io_uring: clean up buffer select
## [1661] fc0ae0244bbb - io_uring: init opcode in io_init_req()
## [1660] e0eb71dcfc4b - io_uring: don't return from io_drain_req()
## [1659] 22b2ca310afc - io_uring: extra a helper for drain init
## [1658] 5e371265ea1d - io_uring: disable draining earlier
## [1657] a1cdbb4cb5f7 - io_uring: comment why inline complete calls io_clean_op()
## [1656] ef05d9ebcc92 - io_uring: kill off ->inflight_entry field
## [1655] 6962980947e2 - io_uring: restructure submit sqes to_submit checks
## [1654] d9f9d2842c91 - io_uring: reshuffle queue_sqe completion handling
## [1653] d475a9a6226c - io_uring: inline hot path of __io_queue_sqe()
## [1652] 4652fe3f10e5 - io_uring: split slow path from io_queue_sqe
## [1651] 2a56a9bd64db - io_uring: remove drain_active check from hot path
## [1650] f15a3431775a - io_uring: deduplicate io_queue_sqe() call sites
## [1649] 553deffd0920 - io_uring: don't pass state to io_submit_state_end
## [1648] 1cce17aca621 - io_uring: don't pass tail into io_free_batch_list
## [1647] d4b7a5ef2b9c - io_uring: inline completion batching helpers
## [1646] f5ed3bcd5b11 - io_uring: optimise batch completion
## [1645] b3fa03fd1b17 - io_uring: convert iopoll_completed to store_release
## [1644] 3aa83bfb6e5c - io_uring: add a helper for batch free
## [1643] 5eef4e87eb0b - io_uring: use single linked list for iopoll
## [1642] e3f721e6f6d5 - io_uring: split iopoll loop
## [1641] c2b6c6bc4e0d - io_uring: replace list with stack for req caches
## [1640] 3ab665b74e59 - io_uring: remove allocation cache array
## [1639] 6f33b0bc4ea4 - io_uring: use slist for completion batching
## [1638] 5ba3c874eb8a - io_uring: make io_do_iopoll return number of reqs
## [1637] 87a115fb715b - io_uring: force_nonspin
## [1636] 6878b40e7b28 - io_uring: mark having different creds unlikely
## [1635] 8d4af6857c6f - io_uring: return boolean value for io_alloc_async_data
## [1634] 68fe256aadc0 - io_uring: optimise io_req_init() sqe flags checks
## [1633] a3f349071eb0 - io_uring: remove ctx referencing from complete_post
## [1632] 83f84356bc8f - io_uring: add more uring info to fdinfo for debug
## [1631] d97ec6239ad8 - io_uring: kill extra wake_up_process in tw add
## [1630] c450178d9be9 - io_uring: dedup CQE flushing non-empty checks
## [1629] d81499bfcd47 - io_uring: inline linked part of io_req_find_next
## [1628] 6b639522f63f - io_uring: inline io_dismantle_req
## [1627] 4b628aeb69cc - io_uring: kill off ios_left
## [1626] a87acfde9491 - io_uring: dump sqe contents if issue fails
## [1625] 4f5022453acd - nvme: wire up completion batching for the IRQ path
## [1624] b688f11e86c9 - io_uring: utilize the io batching infrastructure for more efficient polled IO
## [1623] 19416123ab3e - block: define 'struct bvec_iter' as packed
## [1622] d729cf9acb93 - io_uring: don't sleep when polling for I/O
## [1621] ef99b2d37666 - block: replace the spin argument to blk_iopoll with a flags argument
## [1620] 30da1b45b130 - io_uring: fix a layering violation in io_iopoll_req_issued
## [1619] 94c2ed58d0d8 - direct-io: remove blk_poll support
## [1618] d38a9c04c0d5 - block: only check previous entry for plug merge attempt
## [1617] 14cfbb7a7856 - io_uring: fix wrong condition to grab uring lock
## [1616] 3f008385d46d - io_uring: kill fasync
## [1615] 7df778be2f61 - io_uring: make OP_CLOSE consistent with direct open
## [1614] 9f3a2cb228c2 - io_uring: kill extra checks in io_write()
## [1613] cdb31c29d397 - io_uring: don't punt files update to io-wq unconditionally
## [1612] 9990da93d2bf - io_uring: put provided buffer meta data under memcg accounting
## [1611] 8bab4c09f24e - io_uring: allow conditional reschedule for intensive iterators
## [1610] 5b7aa38d86f3 - io_uring: fix potential req refcount underflow
## [1609] a62682f92eed - io_uring: fix missing set of EPOLLONESHOT for CQ ring overflow
## [1608] bd99c71bd140 - io_uring: fix race between poll completion and cancel_hash insertion
## [1607] d9d8c93938c4 - Smack: Brutalist io_uring support
## [1606] 740b03414b20 - selinux: add support for the io_uring access controls
## [1605] cdc1404a4046 - lsm,io_uring: add LSM hooks to io_uring
## [1604] 91a9ab7c942a - io_uring: convert io_uring to the secure anon inode interface
## [1603] 67daf270cebc - audit: add filtering for io_uring records
## [1602] 5bd2182d58e9 - audit,io_uring,io-wq: add some basic audit support to io_uring
## [1601] b66ceaf324b3 - io_uring: move iopoll reissue into regular IO path
## [1600] cd65869512ab - io_uring: use iov_iter state save/restore helpers
## [1599] 5d329e1286b0 - io_uring: allow retry for O_NONBLOCK if async is supported
## [1598] 9c7b0ba88751 - io_uring: auto-removal for direct open/accept
## [1597] 44df58d441a9 - io_uring: fix missing sigmask restore in io_cqring_wait()
## [1596] e5f71d60ff16 - /dev/mem: nowait zero/null ops
## [1595] 41d3a6bd1d37 - io_uring: pin SQPOLL data before unlocking ring lock
## [1594] dd47c104533d - io-wq: provide IO_WQ_* constants for IORING_REGISTER_IOWQ_MAX_WORKERS arg items
## [1593] 16c8d2df7ec0 - io_uring: ensure symmetry in handling iter types in loop_rw_iter()
## [1592] 32c2d33e0b7c - io_uring: fix off-by-one in BUILD_BUG_ON check of __REQ_F_LAST_BIT
## [1591] 2ae2eb9dde18 - io_uring: fail links of cancelled timeouts
## [1590] 66e70be72288 - io-wq: fix memory leak in create_io_worker()
## [1589] 3b33e3f4a6c0 - io-wq: fix silly logic error in io_task_work_match()
## [1588] 009ad9f0c6ee - io_uring: drop ctx->uring_lock before acquiring sqd->lock
## [1587] c57a91fb1ccf - io_uring: fix missing mb() before waitqueue_active
## [1586] 713b9825a4c4 - io-wq: fix cancellation on create-worker failure
## [1585] 89c2b3b74918 - io_uring: reexpand under-reexpanded iters
## [1584] 2fc2a7a62eb5 - io_uring: io_uring_complete() trace should take an integer
## [1583] 31efe48eb5dc - io_uring: fix possible poll event lost in multi shot mode
## [1582] 8d4ad41e3e8e - io_uring: prolong tctx_task_work() with flushing
## [1581] 636378535afb - io_uring: don't disable kiocb_done() CQE batching
## [1580] fa84693b3c89 - io_uring: ensure IORING_REGISTER_IOWQ_MAX_WORKERS works with SQPOLL
## [1579] 15e20db2e0ce - io-wq: only exit on fatal signals
## [1578] b8ce1b9d25cc - io_uring: don't submit half-prepared drain request
## [1577] c6d3d9cbd659 - io_uring: fix queueing half-created requests
## [1576] 7db304375e11 - io_uring: retry in case of short read on block device
## [1575] 7b3188e7ed54 - io_uring: IORING_OP_WRITE needs hash_reg_file set
## [1574] a9a4aa9fbfc5 - io-wq: wqe and worker locks no longer need to be IRQ safe
## [1573] f1042b6ccb88 - io_uring: allow updating linked timeouts
## [1572] ef9dd637084d - io_uring: keep ltimeouts in a list
## [1571] 50c1df2b56e0 - io_uring: support CLOCK_BOOTTIME/REALTIME for timeouts
## [1570] 90499ad00ca5 - io_uring: add build check for buf_index overflows
## [1569] b18a1a4574d2 - io_uring: clarify io_req_task_cancel() locking
## [1568] 9a10867ae54e - io_uring: add task-refs-get helper
## [1567] a8295b982c46 - io_uring: fix failed linkchain code logic
## [1566] 14afdd6ee3a0 - io_uring: remove redundant req_set_fail()
## [1565] 0c6e1d7fd5e7 - io_uring: don't free request to slab
## [1564] aaa4db12ef7b - io_uring: accept directly into fixed file table
## [1563] a7083ad5e307 - io_uring: hand code io_accept() fd installing
## [1562] b9445598d8c6 - io_uring: openat directly into fixed fd table
## [1561] d32f89da7fa8 - net: add accept helper not installing fd
## [1560] cf30da90bc3a - io_uring: add support for IORING_OP_LINKAT
## [1559] 7a8721f84fcb - io_uring: add support for IORING_OP_SYMLINKAT
## [1558] 394918ebb889 - io_uring: enable use of bio alloc cache
## [1557] dadebc350da2 - io_uring: fix io_try_cancel_userdata race for iowq
## [1556] e34a02dc40c9 - io_uring: add support for IORING_OP_MKDIRAT
## [1555] 8228e2c31319 - namei: add getname_uflags()
## [1554] 126180b95f27 - io_uring: IRQ rw completion batching
## [1553] f237c30a5610 - io_uring: batch task work locking
## [1552] 5636c00d3e8e - io_uring: flush completions for fallbacks
## [1551] 26578cda3db9 - io_uring: add ->splice_fd_in checks
## [1550] 2c5d763c1939 - io_uring: add clarifying comment for io_cqring_ev_posted()
## [1549] 0bea96f59ba4 - io_uring: place fixed tables under memcg limits
## [1548] 3a1b8a4e843f - io_uring: limit fixed table size by RLIMIT_NOFILE
## [1547] 99c8bc52d132 - io_uring: fix lack of protection for compl_nr
## [1546] 187f08c12cd1 - io_uring: Add register support for non-4k PAGE_SIZE
## [1545] e98e49b2bbf7 - io_uring: extend task put optimisations
## [1544] 316319e82f73 - io_uring: add comments on why PF_EXITING checking is safe
## [1543] ec3c3d0f3a27 - io_uring: fix io_timeout_remove locking
## [1542] 23a65db83b3f - io_uring: improve same wq polling
## [1541] 505657bc6c52 - io_uring: reuse io_req_complete_post()
## [1540] ae421d9350b5 - io_uring: better encapsulate buffer select for rw
## [1539] 906c6caaf586 - io_uring: optimise io_prep_linked_timeout()
## [1538] 0756a8691017 - io_uring: cancel not-armed linked touts separately
## [1537] 4d13d1a4d1e1 - io_uring: simplify io_prep_linked_timeout
## [1536] b97e736a4b55 - io_uring: kill REQ_F_LTIMEOUT_ACTIVE
## [1535] fd08e5309bba - io_uring: optimise hot path of ltimeout prep
## [1534] 8cb01fac982a - io_uring: deduplicate cancellation code
## [1533] a8576af9d1b0 - io_uring: kill not necessary resubmit switch
## [1532] fb6820998f57 - io_uring: optimise initial ltimeout refcounting
## [1531] 761bcac1573e - io_uring: don't inflight-track linked timeouts
## [1530] 48dcd38d73c2 - io_uring: optimise iowq refcounting
## [1529] a141dd896f54 - io_uring: correct __must_hold annotation
## [1528] 41a5169c23eb - io_uring: code clean for completion_lock in io_arm_poll_handler()
## [1527] f552a27afe67 - io_uring: remove files pointer in cancellation functions
## [1526] a4aadd11ea49 - io_uring: extract io_uring_files_cancel() in io_uring_task_cancel()
## [1525] 20e60a383208 - io_uring: skip request refcounting
## [1524] 5d5901a34340 - io_uring: remove submission references
## [1523] 91c2f6978311 - io_uring: remove req_ref_sub_and_test()
## [1522] 21c843d5825b - io_uring: move req_ref_get() and friends
## [1521] 79ebeaee8a21 - io_uring: remove IRQ aspect of io_ring_ctx completion lock
## [1520] 8ef12efe26c8 - io_uring: run regular file completions from task_work
## [1519] 89b263f6d56e - io_uring: run linked timeouts from task_work
## [1518] 89850fce16a1 - io_uring: run timeouts from task_work
## [1517] 62906e89e63b - io_uring: remove file batch-get optimisation
## [1516] 6294f3686b4d - io_uring: clean up tctx_task_work()
## [1515] 5d70904367b4 - io_uring: inline io_poll_remove_waitqs
## [1514] 90f67366cb88 - io_uring: remove extra argument for overflow flush
## [1513] cd0ca2e048dc - io_uring: inline struct io_comp_state
## [1512] bb943b8265c8 - io_uring: use inflight_entry instead of compl.list
## [1511] 7255834ed6ef - io_uring: remove redundant args from cache_free
## [1510] c34b025f2d21 - io_uring: cache __io_free_req()'d requests
## [1509] f56165e62fae - io_uring: move io_fallback_req_func()
## [1508] e9dbe221f5d1 - io_uring: optimise putting task struct
## [1507] af066f31eb3d - io_uring: drop exec checks from io_req_task_submit
## [1506] bbbca0948989 - io_uring: kill unused IO_IOPOLL_BATCH
## [1505] 58d3be2c60d2 - io_uring: improve ctx hang handling
## [1504] d3fddf6dddd8 - io_uring: deduplicate open iopoll check
## [1503] 543af3a13da3 - io_uring: inline io_free_req_deferred
## [1502] b9bd2bea0f22 - io_uring: move io_rsrc_node_alloc() definition
## [1501] 6a290a1442b4 - io_uring: move io_put_task() definition
## [1500] e73c5c7cd3e2 - io_uring: extract a helper for ctx quiesce
## [1499] 90291099f24a - io_uring: optimise io_cqring_wait() hot path
## [1498] 282cdc86937b - io_uring: add more locking annotations for submit
## [1497] a2416e1ec23c - io_uring: don't halt iopoll too early
## [1496] 864ea921b030 - io_uring: refactor io_alloc_req
## [1495] 2215bed9246d - io_uring: remove unnecessary PF_EXITING check
## [1494] ebc11b6c6b87 - io_uring: clean io-wq callbacks
## [1493] c97d8a0f68b3 - io_uring: avoid touching inode in rw prep
## [1492] b191e2dfe595 - io_uring: rename io_file_supports_async()
## [1491] ac177053bb2c - io_uring: inline fixed part of io_file_get()
## [1490] 042b0d85eabb - io_uring: use kvmalloc for fixed files
## [1489] 5fd461784059 - io_uring: be smarter about waking multiple CQ ring waiters
## [1488] a30f895ad323 - io_uring: fix xa_alloc_cycle() error return value check
## [1487] 9cb0073b302a - io_uring: pin ctx on fallback execution
## [1486] 21f965221e7c - io_uring: only assign io_uring_enter() SQPOLL error in actual error case
## [1485] 8f40d0370795 - tools/io_uring/io_uring-cp: sync with liburing example
## [1484] 432bc7caef4e - scsi: mpt3sas: Add io_uring iopoll support
## [1483] 43597aac1f87 - io_uring: fix ctx-exit io_rsrc_put_work() deadlock
## [1482] c018db4a57f3 - io_uring: drop ctx->uring_lock before flushing work item
## [1481] 4956b9eaad45 - io_uring: rsrc ref lock needs to be IRQ safe
## [1480] 20c0b380f971 - io_uring: Use WRITE_ONCE() when writing to sq_flags
## [1479] ef98eb0409c3 - io_uring: clear TIF_NOTIFY_SIGNAL when running task work
## [1478] a890d01e4ee0 - io_uring: fix poll requests leaking second poll entries
## [1477] ef04688871f3 - io_uring: don't block level reissue off completion path
## [1476] 773af69121ec - io_uring: always reissue from task_work context
## [1475] 110aa25c3ce4 - io_uring: fix race in unified task_work running
## [1474] 44eff40a32e8 - io_uring: fix io_prep_async_link locking
## [1473] 991468dcf198 - io_uring: explicitly catch any illegal async queue attempt
## [1472] 3c30ef0f78cf - io_uring: never attempt iopoll reissue from release path
## [1471] 0cc936f74bca - io_uring: fix early fdput() of file
## [1470] 362a9e652892 - io_uring: fix memleak in io_init_wq_offload()
## [1469] 46fee9ab02cb - io_uring: remove double poll entry on arm failure
## [1468] 68b11e8b1562 - io_uring: explicitly count entries for poll reqs
## [1467] 1b48773f9fd0 - io_uring: fix io_drain_req()
## [1466] 9c6882608bce - io_uring: use right task for exiting checks
## [1465] 9ce85ef2cb5c - io_uring: remove dead non-zero 'poll' check
## [1464] 8f487ef2cbb2 - io_uring: mitigate unlikely iopoll lag
## [1463] c32aace0cf93 - io_uring: fix drain alloc fail return code
## [1462] e09ee510600b - io_uring: fix exiting io_req_task_work_add leaks
## [1461] 5b0a6acc73fc - io_uring: simplify task_work func
## [1460] 9011bf9a13e3 - io_uring: fix stuck fallback reqs
## [1459] e149bd742b2d - io_uring: code clean for kiocb_done()
## [1458] 915b3dde9b72 - io_uring: spin in iopoll() only when reqs are in a single queue
## [1457] 99ebe4efbd38 - io_uring: pre-initialise some of req fields
## [1456] 5182ed2e332e - io_uring: refactor io_submit_flush_completions
## [1455] 4cfb25bf8877 - io_uring: optimise hot path restricted checks
## [1454] e5dc480d4ed9 - io_uring: remove not needed PF_EXITING check
## [1453] dd432ea5204e - io_uring: mainstream sqpoll task_work running
## [1452] b2d9c3da7711 - io_uring: refactor io_arm_poll_handler()
## [1451] 59b735aeeb0f - io_uring: reduce latency by reissueing the operation
## [1450] 22634bc5620d - io_uring: add IOPOLL and reserved field checks to IORING_OP_UNLINKAT
## [1449] ed7eb2592286 - io_uring: add IOPOLL and reserved field checks to IORING_OP_RENAMEAT
## [1448] 12dcb58ac785 - io_uring: refactor io_openat2()
## [1447] 9ba6a1c06279 - io_uring: simplify struct io_uring_sqe layout
## [1446] 16340eab61a3 - io_uring: update sqe layout build checks
## [1445] fe7e32575029 - io_uring: fix code style problems
## [1444] 1a924a808208 - io_uring: refactor io_sq_thread()
## [1443] 948e19479cb6 - io_uring: don't change sqpoll creds if not needed
## [1442] 4ce8ad95f0af - io_uring: Create define to modify a SQPOLL parameter
## [1441] 997135017716 - io_uring: Fix race condition when sqp thread goes to sleep
## [1440] 7a778f9dc32d - io_uring: improve in tctx_task_work() resubmission
## [1439] 16f72070386f - io_uring: don't resched with empty task_list
## [1438] c6538be9e488 - io_uring: refactor tctx task_work list splicing
## [1437] ebd0df2e6342 - io_uring: optimise task_work submit flushing
## [1436] 3f18407dc6f2 - io_uring: inline __tctx_task_work()
## [1435] a3dbdf54da80 - io_uring: refactor io_get_sequence()
## [1434] c854357bc1b9 - io_uring: clean all flags in io_clean_op() at once
## [1433] 1dacb4df4ebe - io_uring: simplify iovec freeing in io_clean_op()
## [1432] b8e64b530011 - io_uring: track request creds with a flag
## [1431] c10d1f986b4e - io_uring: move creds from io-wq work to io_kiocb
## [1430] 2a2758f26df5 - io_uring: refactor io_submit_flush_completions()
## [1429] e6ab8991c5d0 - io_uring: fix false WARN_ONCE
## [1428] fe76421d1da1 - io_uring: allow user configurable IO thread CPU affinity
## [1427] 3d7b7b5285f0 - io_uring: minor clean up in trace events definition
## [1426] 236daeae3616 - io_uring: Add to traces the req pointer when available
## [1425] 2335f6f5ddf2 - io_uring: optimise io_commit_cqring()
## [1424] 3c19966d3710 - io_uring: shove more drain bits out of hot path
## [1423] 10c669040e9b - io_uring: switch !DRAIN fast path when possible
## [1422] 27f6b318dea2 - io_uring: fix min types mismatch in table alloc
## [1421] dd9ae8a0b298 - io_uring: Fix comment of io_get_sqe
## [1420] 441b8a7803bf - io_uring: optimise non-drain path
## [1419] 76cc33d79175 - io_uring: refactor io_req_defer()
## [1418] 0499e582aaff - io_uring: move uring_lock location
## [1417] 311997b3fcdd - io_uring: wait heads renaming
## [1416] 5ed7a37d21b3 - io_uring: clean up check_overflow flag
## [1415] 5e159204d7ed - io_uring: small io_submit_sqe() optimisation
## [1414] f18ee4cf0a27 - io_uring: optimise completion timeout flushing
## [1413] 15641e427070 - io_uring: don't cache number of dropped SQEs
## [1412] 17d3aeb33cda - io_uring: refactor io_get_sqe()
## [1411] 7f1129d227ea - io_uring: shuffle more fields into SQ ctx section
## [1410] b52ecf8cb5b5 - io_uring: move ctx->flags from SQ cacheline
## [1409] c7af47cf0fab - io_uring: keep SQ pointers in a single cacheline
## [1408] fdd1dc316e89 - io_uring: Fix incorrect sizeof operator for copy_from_user call
## [1407] aeab9506ef50 - io_uring: inline io_iter_do_read()
## [1406] 78cc687be9c5 - io_uring: unify SQPOLL and user task cancellations
## [1405] 09899b19155a - io_uring: cache task struct refs
## [1404] 2d091d62b110 - io_uring: don't vmalloc rsrc tags
## [1403] 9123c8ffce16 - io_uring: add helpers for 2 level table alloc
## [1402] 157d257f99c1 - io_uring: remove rsrc put work irq save/restore
## [1401] d878c81610e1 - io_uring: hide rsrc tag copy into generic helpers
## [1400] eef51daa72f7 - io_uring: rename function *task_file
## [1399] cb3d8972c78a - io_uring: refactor io_iopoll_req_issued
## [1398] 976517f162a0 - io_uring: fix blocking inline submission
## [1397] 40dad765c045 - io_uring: enable shmem/memfd memory registration
## [1396] d0acdee296d4 - io_uring: don't bounce submit_state cachelines
## [1395] d068b5068d43 - io_uring: rename io_get_cqring
## [1394] 8f6ed49a4443 - io_uring: kill cached_cq_overflow
## [1393] ea5ab3b57983 - io_uring: deduce cq_mask from cq_entries
## [1392] a566c5562d41 - io_uring: remove dependency on ring->sq/cq_entries
## [1391] b13a8918d395 - io_uring: better locality for rsrc fields
## [1390] b986af7e2df4 - io_uring: shuffle rarely used ctx fields
## [1389] 93d2bcd2cbfe - io_uring: make fail flag not link specific
## [1388] 3dd0c97a9e01 - io_uring: get rid of files in exit cancel
## [1387] acfb381d9d71 - io_uring: simplify waking sqo_sq_wait
## [1386] 21f2fc080f86 - io_uring: remove unused park_task_work
## [1385] aaa9f0f48172 - io_uring: improve sq_thread waiting check
## [1384] e4b6d902a9e3 - io_uring: improve sqpoll event/state handling
## [1383] 9690557e22d6 - io_uring: add feature flag for rsrc tags
## [1382] 992da01aa932 - io_uring: change registration/upd/rsrc tagging ABI
## [1381] f13ef10059cc - net: annotate data race in sock_error()
## [1380] 06af8679449d - coredump: Limit what can interrupt coredumps
## [1379] 216e5835966a - io_uring: fix misaccounting fix buf pinned pages
## [1378] b16ef427adf3 - io_uring: fix data race to avoid potential NULL-deref
## [1377] 3743c1723bfc - io-wq: Fix UAF when wakeup wqe in hash waitqueue
## [1376] 17a91051fe63 - io_uring/io-wq: close io-wq full-stop gap
## [1375] b5f3352e0868 - blkcg: drop CLONE_IO check in blkcg_can_attach()
## [1374] ba5ef6dc8a82 - io_uring: fortify tctx/io_wq cleanup
## [1373] 0169d8f33ab7 - Revert "Smack: Handle io_uring kernel thread privileges"
## [1372] 7a274727702c - io_uring: don't modify req->poll for rw
## [1371] 489809e2e22b - io_uring: increase max number of reg buffers
## [1370] 2d74d0421e5a - io_uring: further remove sqpoll limits on opcodes
## [1369] 447c19f3b507 - io_uring: fix ltout double free on completion race
## [1368] a298232ee6b9 - io_uring: fix link timeout refs
## [1367] cf7b39a0cbf6 - block: reexpand iov_iter after read/write
## [1366] 50b7b6f29de3 - x86/process: setup io_threads more like normal user space threads
## [1365] a5e7da1494e1 - MAINTAINERS: add io_uring tool to IO_URING
## [1364] d1f82808877b - io_uring: truncate lengths larger than MAX_RW_COUNT on provide buffers
## [1363] 63135aa3866d - mm: provide filemap_range_needs_writeback() helper
## [1362] bb6659cc0ad3 - io_uring: Fix memory leak in io_sqe_buffers_register()
## [1361] cf3770e78421 - io_uring: Fix premature return from loop and memory leak
## [1360] 47b228ce6f66 - io_uring: fix unchecked error in switch_start()
## [1359] 6224843d56e0 - io_uring: allow empty slots for reg buffers
## [1358] b0d658ec88a6 - io_uring: add more build check for uapi
## [1357] dddca22636c9 - io_uring: dont overlap internal and user req flags
## [1356] 2840f710f23a - io_uring: fix drain with rsrc CQEs
## [1355] 7b289c38335e - io_uring: maintain drain logic for multishot poll requests
## [1354] 6d042ffb598e - io_uring: Check current->io_uring in io_uring_cancel_sqpoll
## [1353] 0b8c0e7c9692 - io_uring: fix NULL reg-buffer
## [1352] 9f59a9d88d3b - io_uring: simplify SQPOLL cancellations
## [1351] 28090c133869 - io_uring: fix work_exit sqpoll cancellations
## [1350] 615cee49b3ca - io_uring: Fix uninitialized variable up.resv
## [1349] a2b4198cab7e - io_uring: fix invalid error check after malloc
## [1348] a2a7cc32a5e8 - io_uring: io_sq_thread() no longer needs to reset current->pf_io_worker
## [1347] 2b4ae19c6d48 - io_uring: update sq_thread_idle after ctx deleted
## [1346] 634d00df5e1c - io_uring: add full-fledged dynamic buffers support
## [1345] bd54b6fe3316 - io_uring: implement fixed buffers registration similar to fixed files
## [1344] eae071c9b4ce - io_uring: prepare fixed rw for dynanic buffers
## [1343] 41edf1a5ec96 - io_uring: keep table of pointers to ubufs
## [1342] c3bdad027183 - io_uring: add generic rsrc update with tags
## [1341] 792e35824be9 - io_uring: add IORING_REGISTER_RSRC
## [1340] fdecb66281e1 - io_uring: enumerate dynamic resources
## [1339] 98f0b3b4f1d5 - io_uring: add generic path for rsrc update
## [1338] b60c8dce3389 - io_uring: preparation for rsrc tagging
## [1337] d4d19c19d6ae - io_uring: decouple CQE filling from requests
## [1336] 44b31f2fa2c4 - io_uring: return back rsrc data free helper
## [1335] fff4db76be29 - io_uring: move __io_sqe_files_unregister
## [1334] 724cb4f9ec90 - io_uring: check sqring and iopoll_list before shedule
## [1333] f2a48dd09b8e - io_uring: refactor io_sq_offload_create()
## [1332] 07db298a1c96 - io_uring: safer sq_creds putting
## [1331] 3a0a69023592 - io_uring: move inflight un-tracking into cleanup
## [1330] 734551df6f9b - io_uring: fix shared sqpoll cancellation hangs
## [1329] 3b763ba1c77d - io_uring: remove extra sqpoll submission halting
## [1328] 75c4021aacbd - io_uring: check register restriction afore quiesce
## [1327] 38134ada0cee - io_uring: fix overflows checks in provide buffers
## [1326] c82d5bc70382 - io_uring: don't fail submit with overflow backlog
## [1325] a7be7c23cfdd - io_uring: fix merge error for async resubmit
## [1324] 75652a30ff67 - io_uring: tie req->apoll to request lifetime
## [1323] 4e3d9ff905cd - io_uring: put flag checking for needing req cleanup in one spot
## [1322] ea6a693d862d - io_uring: disable multishot poll for double poll add cases
## [1321] c7d95613c7d6 - io_uring: fix early sqd_list removal sqpoll hangs
## [1320] c5de00366e3e - io_uring: move poll update into remove not add
## [1319] 9096af3e9c87 - io_uring: add helper for parsing poll events
## [1318] 9ba5fac8cf3b - io_uring: fix POLL_REMOVE removing apoll
## [1317] 7f00651aebc9 - io_uring: refactor io_ring_exit_work()
## [1316] f39c8a5b1130 - io_uring: inline io_iopoll_getevents()
## [1315] e9979b36a467 - io_uring: skip futile iopoll iterations
## [1314] cce4b8b0ce1f - io_uring: don't fail overflow on in_idle
## [1313] e31001a3abb8 - io_uring: clean up io_poll_remove_waitqs()
## [1312] fd9c7bc542da - io_uring: refactor hrtimer_try_to_cancel uses
## [1311] 8c855885b8b3 - io_uring: add timeout completion_lock annotation
## [1310] 9d8058926be7 - io_uring: split poll and poll update structures
## [1309] 66d2d00d0ac4 - io_uring: fix uninit old data for poll event upd
## [1308] 084804002e51 - io_uring: fix leaking reg files on exit
## [1307] f70865db5ff3 - io_uring: return back safer resurrect
## [1306] e4335ed33eb5 - io_uring: improve hardlink code generation
## [1305] 88885f66e8c6 - io_uring: improve sqo stop
## [1304] aeca241b0bdd - io_uring: split file table from rsrc nodes
## [1303] 87094465d01a - io_uring: cleanup buffer register
## [1302] 7f61a1e9ef51 - io_uring: add buffer unmap helper
## [1301] 3e9424989b59 - io_uring: simplify io_rsrc_data refcounting
## [1300] a1ff1e3f0e1c - io_uring: provide io_resubmit_prep() stub for !CONFIG_BLOCK
## [1299] 8d13326e56c1 - io_uring: optimise fill_event() by inlining
## [1298] ff64216423d4 - io_uring: always pass cflags into fill_event()
## [1297] 44c769de6ffc - io_uring: optimise non-eventfd post-event
## [1296] 4af3417a347d - io_uring: refactor compat_msghdr import
## [1295] 0bdf3398b06e - io_uring: enable inline completion for more cases
## [1294] a1fde923e306 - io_uring: refactor io_close
## [1293] 3f48cf18f886 - io_uring: unify files and task cancel
## [1292] b303fe2e5a38 - io_uring: track inflight requests through counter
## [1291] 368b2080853f - io_uring: unify task and files cancel loops
## [1290] 0ea13b448ee7 - io_uring: simplify apoll hash removal
## [1289] e27414bef7b4 - io_uring: refactor io_poll_complete()
## [1288] f40b964a66ac - io_uring: clean up io_poll_task_func()
## [1287] cb3b200e4f66 - io_uring: don't attempt re-add of multishot poll request if racing
## [1286] 53a3126756d6 - io_uring: kill outdated comment about splice punt
## [1285] a04b0ac0cb64 - io_uring: encapsulate fixed files into struct
## [1284] 846a4ef22bf6 - io_uring: refactor file tables alloc/free
## [1283] f4f7d21ce464 - io_uring: don't quiesce intial files register
## [1282] 9a321c98490c - io_uring: set proper FFS* flags on reg file update
## [1281] 044118069a23 - io_uring: deduplicate NOSIGNAL setting
## [1280] df9727affa05 - io_uring: put link timeout req consistently
## [1279] c4ea060e85ea - io_uring: simplify overflow handling
## [1278] e07785b00291 - io_uring: lock annotate timeouts and poll
## [1277] 47e90392c8ad - io_uring: kill unused forward decls
## [1276] 4751f53d74a6 - io_uring: store reg buffer end instead of length
## [1275] 75769e3f7357 - io_uring: improve import_fixed overflow checks
## [1274] 0aec38fda2b6 - io_uring: refactor io_async_cancel()
## [1273] e146a4a3f69e - io_uring: remove unused hash_wait
## [1272] 7394161cb8bd - io_uring: better ref handling in poll_remove_one
## [1271] 89b5066ea1d9 - io_uring: combine lock/unlock sections on exit
## [1270] 215c39026023 - io_uring: remove useless is_dying check on quiesce
## [1269] 28a9fe252134 - io_uring: reuse io_rsrc_node_destroy()
## [1268] a7f0ed5acdc9 - io_uring: ctx-wide rsrc nodes
## [1267] e7c78371bbf7 - io_uring: refactor io_queue_rsrc_removal()
## [1266] 40ae0ff70fb1 - io_uring: move rsrc_put callback into io_rsrc_data
## [1265] 82fbcfa996e0 - io_uring: encapsulate rsrc node manipulations
## [1264] f3baed39929e - io_uring: use rsrc prealloc infra for files reg
## [1263] 221aa92409f9 - io_uring: simplify io_rsrc_node_ref_zero
## [1262] b895c9a632e7 - io_uring: name rsrc bits consistently
## [1261] b2e720ace221 - io_uring: fix race around poll update and poll triggering
## [1260] 50e96989d736 - io_uring: reg buffer overflow checks hardening
## [1259] 548d819d1eed - io_uring: allow SQPOLL without CAP_SYS_ADMIN or CAP_SYS_NICE
## [1258] b69de288e913 - io_uring: allow events and user_data update of running poll requests
## [1257] b2cb805f6dd4 - io_uring: abstract out a io_poll_find_helper()
## [1256] 5082620fb2ca - io_uring: terminate multishot poll for CQ ring overflow
## [1255] b2c3f7e17156 - io_uring: abstract out helper for removing poll waitqs/hashes
## [1254] 88e41cf928a6 - io_uring: add multishot mode for IORING_OP_POLL_ADD
## [1253] 7471e1afabf8 - io_uring: include cflags in completion trace event
## [1252] 6c2450ae5565 - io_uring: allocate memory for overflowed CQEs
## [1251] 464dca612bc6 - io_uring: mask in error/nval/hangup consistently for poll
## [1250] 9532b99bd9ca - io_uring: optimise rw complete error handling
## [1249] ab454438aa8d - io_uring: hide iter revert in resubmit_prep
## [1248] 8c130827f417 - io_uring: don't alter iopoll reissue fail ret code
## [1247] 1c98679db941 - io_uring: optimise kiocb_end_write for !ISREG
## [1246] 59d7001345a7 - io_uring: kill unused REQ_F_NO_FILE_TABLE
## [1245] e1d675df1a36 - io_uring: don't init req->work fully in advance
## [1244] 05356d86c642 - io_uring: remove tctx->sqpoll
## [1243] 682076801a2f - io_uring: don't do extra EXITING cancellations
## [1242] d4729fbde766 - io_uring: don't clear REQ_F_LINK_TIMEOUT
## [1241] c15b79dee51b - io_uring: optimise io_req_task_work_add()
## [1240] e1d767f078b8 - io_uring: abolish old io_put_file()
## [1239] 094bae49e5ed - io_uring: optimise io_dismantle_req() fast path
## [1238] 68fb897966fe - io_uring: inline io_clean_op()'s fast path
## [1237] 2593553a01c8 - io_uring: remove __io_req_task_cancel()
## [1236] dac7a0986493 - io_uring: add helper flushing locked_free_list
## [1235] a05432fb49b6 - io_uring: refactor io_free_req_deferred()
## [1234] 0d85035a7368 - io_uring: inline io_put_req and friends
## [1233] 8dd03afe611d - io_uring: refactor rsrc refnode allocation
## [1232] dd78f49260dd - io_uring: refactor io_flush_cached_reqs()
## [1231] 1840038e1195 - io_uring: optimise success case of __io_queue_sqe
## [1230] de968c182b4f - io_uring: inline __io_queue_linked_timeout()
## [1229] 966706579a71 - io_uring: keep io_req_free_batch() call locality
## [1228] cf27f3b14961 - io_uring: optimise tctx node checks/alloc
## [1227] 33f993da9829 - io_uring: optimise io_uring_enter()
## [1226] 493f3b158a1e - io_uring: don't take ctx refs in task_work handler
## [1225] 45ab03b19e8b - io_uring: transform ret == 0 for poll cancelation completions
## [1224] b9b0e0d39c7b - io_uring: correct comment on poll vs iopoll
## [1223] 7b29f92da377 - io_uring: cache async and regular file state for fixed files
## [1222] d44f554e105b - io_uring: don't check for io_uring_fops for fixed files
## [1221] c9dca27dc7f9 - io_uring: simplify io_sqd_update_thread_idle()
## [1220] abc54d634334 - io_uring: switch to atomic_t for io_kiocb reference count
## [1219] de9b4ccad750 - io_uring: wrap io_kiocb reference count manipulation in helpers
## [1218] 179ae0d15e8b - io_uring: simplify io_resubmit_prep()
## [1217] b7e298d265f2 - io_uring: merge defer_prep() and prep_async()
## [1216] 26f0505a9ce5 - io_uring: rethink def->needs_async_data
## [1215] 6cb78689fa94 - io_uring: untie alloc_async_data and needs_async_data
## [1214] 2e052d443df1 - io_uring: refactor out send/recv async setup
## [1213] 8c3f9cd1603d - io_uring: use better types for cflags
## [1212] 9fb8cb49c7b6 - io_uring: refactor provide/remove buffer locking
## [1211] f41db2732d48 - io_uring: add a helper failing not issued requests
## [1210] dafecf19e25f - io_uring: further deduplicate file slot selection
## [1209] 2c4b8eb6435e - io_uring: reuse io_req_task_queue_fail()
## [1208] e83acd7d37d8 - io_uring: avoid taking ctx refs for task-cancel
## [1207] c60eb049f4a1 - io-wq: cancel unbounded works on io-wq destroy
## [1206] 9728463737db - io_uring: fix rw req completion
## [1205] 6ad7f2332e84 - io_uring: clear F_REISSUE right after getting it
## [1204] e82ad4853948 - io_uring: fix !CONFIG_BLOCK compilation failure
## [1203] 230d50d448ac - io_uring: move reissue into regular IO path
## [1202] 07204f21577a - io_uring: fix EIOCBQUEUED iter revert
## [1201] 696ee88a7c50 - io_uring/io-wq: protect against sprintf overflow
## [1200] 4b982bd0f383 - io_uring: don't mark S_ISBLK async work as unbounded
## [1199] 82734c5b1b24 - io_uring: drop sqd lock before handling signals for SQPOLL
## [1198] 51520426f4bc - io_uring: handle setup-failed ctx in kill_timeouts
## [1197] 5a978dcfc0f0 - io_uring: always go for cancellation spin on exec
## [1196] 4e53d1701b57 - tomoyo: don't special case PF_IO_WORKER for PF_KTHREAD
## [1195] 2b8ed1c94182 - io_uring: remove unsued assignment to pointer io
## [1194] 78d9d7c2a331 - io_uring: don't cancel extra on files match
## [1193] 2482b58ffbdc - io_uring: don't cancel-track common timeouts
## [1192] 80c4cbdb5ee6 - io_uring: do post-completion chore on t-out cancel
## [1191] 1ee4160c73b2 - io_uring: fix timeout cancel return code
## [1190] e8b33b8cfafc - Revert "kernel: treat PF_IO_WORKER like PF_KTHREAD for ptrace/signals"
## [1189] dbe1bdbb39db - io_uring: handle signals for IO threads like a normal thread
## [1188] 90b8749022bb - io_uring: maintain CQE order of a failed link
## [1187] f5d2d23bf0d9 - io-wq: fix race around pending work on teardown
## [1186] a185f1db59f1 - io_uring: do ctx sqd ejection in a clear context
## [1185] d81269fecb8c - io_uring: fix provide_buffers sign extension
## [1184] b65c128f963d - io_uring: don't skip file_end_write() on reissue
## [1183] d07f1e8a4261 - io_uring: correct io_queue_async_work() traces
## [1182] 0b8cfa974dfc - io_uring: don't use {test,clear}_tsk_thread_flag() for current
## [1181] 0031275d119e - io_uring: call req_set_fail_links() on short send[msg]()/recv[msg]() with MSG_WAITALL
## [1180] de75a3d3f5a1 - io_uring: don't leak creds on SQO attach error
## [1179] ee53fb2b197b - io_uring: use typesafe pointers in io_uring_task
## [1178] 53e043b2b432 - io_uring: remove structures from include/linux/io_uring.h
## [1177] 76cd979f4f38 - io_uring: imply MSG_NOSIGNAL for send[msg]()/recv[msg]() calls
## [1176] b7f5a0bfe206 - io_uring: fix sqpoll cancellation via task_work
## [1175] 9b46571142e4 - io_uring: add generic callback_head helpers
## [1174] 9e138a483454 - io_uring: fix concurrent parking
## [1173] f6d54255f423 - io_uring: halt SQO submission on ctx exit
## [1172] 09a6f4efaa65 - io_uring: replace sqd rw_semaphore with mutex
## [1171] 180f829fe402 - io_uring: fix complete_post use ctx after free
## [1170] efe814a471e0 - io_uring: fix ->flags races by linked timeouts
## [1169] 9e15c3a0ced5 - io_uring: convert io_buffer_idr to XArray
## [1168] 16efa4fce3b7 - io_uring: allow IO worker threads to be frozen
## [1167] 58f993738341 - io_uring: fix OP_ASYNC_CANCEL across tasks
## [1166] 521d6a737a31 - io_uring: cancel sqpoll via task_work
## [1165] 26984fbf3ad9 - io_uring: prevent racy sqd->thread checks
## [1164] 0df8ea602b3f - io_uring: remove useless ->startup completion
## [1163] e1915f76a898 - io_uring: cancel deferred requests in try_cancel
## [1162] d052d1d685f5 - io_uring: perform IOPOLL reaping if canceler is thread itself
## [1161] 5c2469e0a22e - io_uring: force creation of separate context for ATTACH_WQ and non-threads
## [1160] 7d41e8543d80 - io_uring: remove indirect ctx into sqo injection
## [1159] 78d7f6ba82ed - io_uring: fix invalid ctx->sq_thread_idle
## [1158] e22bc9b481a9 - kernel: make IO threads unfreezable by default
## [1157] e8f98f24549d - io_uring: always wait for sqd exited when stopping SQPOLL thread
## [1156] 5199328a0d41 - io_uring: remove unneeded variable 'ret'
## [1155] 93e68e036c2f - io_uring: move all io_kiocb init early in io_init_req()
## [1154] 7a612350a989 - io_uring: fix complete_post races for linked req
## [1153] 33cc89a9fc24 - io_uring: add io_disarm_next() helper
## [1152] 97a73a0f9fbf - io_uring: fix io_sq_offload_create error handling
## [1151] 61cf93700fe6 - io_uring: Convert personality_idr to XArray
## [1150] 0298ef969a11 - io_uring: clean R_DISABLED startup mess
## [1149] f458dd8441e5 - io_uring: fix unrelated ctx reqs cancellation
## [1148] 05962f95f9ac - io_uring: SQPOLL parking fixes
## [1147] 041474885e97 - io_uring: kill io_sq_thread_fork() and return -EOWNERDEAD if the sq_thread is gone
## [1146] 7c30f36a98ae - io_uring: run __io_sq_thread() with the initial creds from io_uring_setup()
## [1145] 1b00764f09b6 - io_uring: cancel reqs of all iowq's on ring exit
## [1144] b5bb3a24f69d - io_uring: warn when ring exit takes too long
## [1143] baf186c4d345 - io_uring: index io_uring->xa by ctx not file
## [1142] eebd2e37e662 - io_uring: don't take task ring-file notes
## [1141] d56d938b4bef - io_uring: do ctx initiated file note removal
## [1140] 13bf43f5f473 - io_uring: introduce ctx to tctx back map
## [1139] 2941267bd3da - io_uring: make del_task_file more forgiving
## [1138] 886d0137f104 - io-wq: fix race in freeing 'wq' and worker access
## [1137] e45cff588588 - io_uring: don't restrict issue_flags for io_openat
## [1136] 86e0d6766cf9 - io_uring: make SQPOLL thread parking saner
## [1135] b5b0ecb736f1 - io_uring: clear IOCB_WAITQ for non -EIOCBQUEUED return
## [1134] ca0a26511c67 - io_uring: don't keep looping for more events if we can't flush overflow
## [1133] 46fe18b16c46 - io_uring: move to using create_io_thread()
## [1132] cc440e8738e5 - kernel: provide create_io_thread() helper
## [1131] dd59a3d595cc - io_uring: reliably cancel linked timeouts
## [1130] b05a1bcd4018 - io_uring: cancel-match based on flags
## [1129] 9e4bec5b2a23 - scsi: megaraid_sas: mq_poll support
## [1128] e4b4a13f4941 - io_uring: ensure that threads freeze on suspend
## [1127] b23fcf477f85 - io_uring: remove extra in_idle wake up
## [1126] ebf936670721 - io_uring: inline __io_queue_async_work()
## [1125] f85c310ac376 - io_uring: inline io_req_clean_work()
## [1124] 64c7212391e7 - io_uring: choose right tctx->io_wq for try cancel
## [1123] 3e6a0d3c7571 - io_uring: fix -EAGAIN retry with IOPOLL
## [1122] 16270893d712 - io_uring: remove sqo_task
## [1121] 70aacfe66136 - io_uring: kill sqo_dead and sqo submission halting
## [1120] 1c3b3e6527e5 - io_uring: ignore double poll add on the same waitqueue head
## [1119] 3ebba796fa25 - io_uring: ensure that SQPOLL thread is started for exit
## [1118] 28c4721b80a7 - io_uring: replace cmpxchg in fallback with xchg
## [1117] 2c32395d8111 - io_uring: fix __tctx_task_work() ctx race
## [1116] 0d30b3e7eea9 - io_uring: kill io_uring_flush()
## [1115] 914390bcfdd6 - io_uring: kill unnecessary io_run_ctx_fallback() in io_ring_exit_work()
## [1114] 5730b27e84fd - io_uring: move cred assignment into io_issue_sqe()
## [1113] 1575f21a0920 - io_uring: kill unnecessary REQ_F_WORK_INITIALIZED checks
## [1112] 4010fec41fd9 - io_uring: remove unused argument 'tsk' from io_req_caches_free()
## [1111] 8452d4a674b0 - io_uring: destroy io-wq on exec
## [1110] ef8eaa4e65fa - io_uring: warn on not destroyed io-wq
## [1109] 1d5f360dd1a3 - io_uring: fix race condition in task_work add and clear
## [1108] afcc4015d1bf - io-wq: provide an io_wq_put_and_exit() helper
## [1107] 8629397e6e27 - io_uring: don't use complete_all() on SQPOLL thread exit
## [1106] ba50a036f23c - io_uring: run fallback on cancellation
## [1105] e54945ae947f - io_uring: SQPOLL stop error handling fixes
## [1104] 5f3f26f98ae4 - io_uring: fix SQPOLL thread handling over exec
## [1103] eb85890b29e4 - io_uring: ensure SQPOLL startup is triggered before error shutdown
## [1102] cb5e1b81304e - Revert "io_uring: wait potential ->release() on resurrect"
## [1101] 8a378fb096a7 - io_uring: ensure io-wq context is always destroyed for tasks
## [1100] 62e398be275a - io_uring: cleanup ->user usage
## [1099] 1c0aa1fae1ac - io_uring: flag new native workers with IORING_FEAT_NATIVE_WORKERS
## [1098] e54937963fa2 - net: remove cmsg restriction from io_uring based send/recvmsg calls
## [1097] e5547d2c5eb3 - io_uring: fix locked_free_list caches_free()
## [1096] 7c977a58dc83 - io_uring: don't attempt IO reissue from the ring exit path
## [1095] 37d1e2e3642e - io_uring: move SQPOLL thread io-wq forked worker
## [1094] 6b09b4d33bd9 - block: fix potential IO hang when turning off io_poll
## [1093] 8e5c66c485a8 - io_uring: clear request count when freeing caches
## [1092] 843bbfd49f02 - io-wq: make io_wq_fork_thread() available to other users
## [1091] 4379bf8bd70b - io_uring: remove io_identity
## [1090] 44526bedc2ff - io_uring: remove any grabbing of context
## [1089] 5aa75ed5b93f - io_uring: tie async worker side to the task context
## [1088] d25e3a3de0d6 - io_uring: disable io-wq attaching
## [1087] 7c25c0d16ef3 - io_uring: remove the need for relying on an io-wq fallback worker
## [1086] b6c23dd5a483 - io_uring: run task_work on io_uring_register()
## [1085] ebf4a5db690a - io_uring: fix leaving invalid req->flags
## [1084] 88f171ab7798 - io_uring: wait potential ->release() on resurrect
## [1083] f2303b1f8244 - io_uring: keep generic rsrc infra generic
## [1082] e6cb007c45de - io_uring: zero ref_node after killing it
## [1081] 99a100816471 - io_uring: make the !CONFIG_NET helpers a bit more robust
## [1080] 8bad28d8a305 - io_uring: don't hold uring_lock when calling io_run_task_work*
## [1079] a3df769899c0 - io_uring: fail io-wq submission from a task_work
## [1078] 792bb6eb8623 - io_uring: don't take uring_lock during iowq cancel
## [1077] de59bc104c24 - io_uring: fail links more in io_submit_sqe()
## [1076] 1ee43ba8d267 - io_uring: don't do async setup for links' heads
## [1075] be7053b7d028 - io_uring: do io_*_prep() early in io_submit_sqe()
## [1074] 93642ef88434 - io_uring: split sqe-prep and async setup
## [1073] cf1096042651 - io_uring: don't submit link on error
## [1072] a1ab7b35db8f - io_uring: move req link into submit_state
## [1071] a6b8cadcea86 - io_uring: move io_init_req() into io_submit_sqe()
## [1070] b16fed66bc7d - io_uring: move io_init_req()'s definition
## [1069] 441960f3b9b8 - io_uring: don't duplicate ->file check in sfr
## [1068] 1155c76a2483 - io_uring: keep io_*_prep() naming consistent
## [1067] 46c4e16a8625 - io_uring: kill fictitious submit iteration index
## [1066] fe1cdd558619 - io_uring: fix read memory leak
## [1065] 0b81e80c813f - io_uring: tctx->task_lock should be IRQ safe
## [1064] 0d4370cfe36b - proc: don't allow async path resolution of /proc/thread-self components
## [1063] 41be53e94fb0 - io_uring: kill cached requests from exiting task closing the ring
## [1062] 9a4fdbd8ee0d - io_uring: add helper to free all request caches
## [1061] 68e68ee6e359 - io_uring: allow task match to be passed to io_req_cache_free()
## [1060] 5be9ad1e4287 - io_uring: optimise io_init_req() flags setting
## [1059] cdbff9822333 - io_uring: clean io_req_find_next() fast check
## [1058] dc0eced5d920 - io_uring: don't check PF_EXITING from syscall
## [1057] 4fccfcbb7337 - io_uring: don't split out consume out of SQE get
## [1056] 04fc6c802dfa - io_uring: save ctx put/get for task_work submit
## [1055] 921b9054e0c4 - io_uring: don't duplicate io_req_task_queue()
## [1054] 4e32635834a3 - io_uring: optimise SQPOLL mm/files grabbing
## [1053] d3d7298d05cb - io_uring: optimise out unlikely link queue
## [1052] bd75904590de - io_uring: take compl state from submit state
## [1051] 2f8e45f16c57 - io_uring: inline io_complete_rw_common()
## [1050] 23faba36ce28 - io_uring: move res check out of io_rw_reissue()
## [1049] f161340d9e85 - io_uring: simplify iopoll reissuing
## [1048] 6e833d538b31 - io_uring: clean up io_req_free_batch_finish()
## [1047] 3c1a2ead915c - io_uring: move submit side state closer in the ring
## [1046] e68a3ff8c342 - io_uring: assign file_slot prior to calling io_sqe_file_register()
## [1045] 4a245479c231 - io_uring: remove redundant initialization of variable ret
## [1044] 34343786ecc5 - io_uring: unpark SQPOLL thread for cancelation
## [1043] 92c75f7594d5 - Revert "io_uring: don't take fs for recvmsg/sendmsg"
## [1042] 26bfa89e25f4 - io_uring: place ring SQ/CQ arrays under memcg memory limits
## [1041] 91f245d5d5de - io_uring: enable kmemcg account for io_uring requests
## [1040] c7dae4ba46c9 - io_uring: enable req cache for IRQ driven IO
## [1039] ed670c3f90a6 - io_uring: fix possible deadlock in io_uring_poll
## [1038] e5d1bc0a91f1 - io_uring: defer flushing cached reqs
## [1037] c5eef2b9449b - io_uring: take comp_state from ctx
## [1036] 65453d1efbd2 - io_uring: enable req cache for task_work items
## [1035] 7cbf1722d5fc - io_uring: provide FIFO ordering for task_work
## [1034] 1b4c351f6eb7 - io_uring: use persistent request cache
## [1033] 6ff119a6e4c3 - io_uring: feed reqs back into alloc cache
## [1032] bf019da7fcbe - io_uring: persistent req cache
## [1031] 9ae7246321d2 - io_uring: count ctx refs separately from reqs
## [1030] 3893f39f2245 - io_uring: remove fallback_req
## [1029] 905c172f32c5 - io_uring: submit-completion free batching
## [1028] 6dd0be1e2481 - io_uring: replace list with array for compl batch
## [1027] 5087275dba02 - io_uring: don't reinit submit state every time
## [1026] ba88ff112bdf - io_uring: remove ctx from comp_state
## [1025] 258b29a93bfe - io_uring: don't keep submit_state on stack
## [1024] 889fca73287b - io_uring: don't propagate io_comp_state
## [1023] 61e982030479 - io_uring: make op handlers always take issue flags
## [1022] 45d189c60629 - io_uring: replace force_nonblock with flags
## [1021] 0e9ddb39b7d9 - io_uring: cleanup up cancel SQPOLL reqs across exec
## [1020] 257e84a5377f - io_uring: refactor sendmsg/recvmsg iov managing
## [1019] 5476dfed29ad - io_uring: clean iov usage for recvmsg buf select
## [1018] 2a7808024b19 - io_uring: set msg_name on msg fixup
## [1017] aec18a57edad - io_uring: drop mm/files between task_work_submit
## [1016] 5280f7e530f7 - io_uring/io-wq: return 2-step work swap scheme
## [1015] ea64ec02b31d - io_uring: deduplicate file table slot calculation
## [1014] 847595de1732 - io_uring: io_import_iovec return type cleanup
## [1013] 75c668cdd6ca - io_uring: treat NONBLOCK and RWF_NOWAIT similarly
## [1012] b23df91bff95 - io_uring: highlight read-retry loop
## [1011] 5ea5dd45844d - io_uring: inline io_read()'s iovec freeing
## [1010] 7335e3bf9d0a - io_uring: don't forget to adjust io_size
## [1009] 6bf985dc50dd - io_uring: let io_setup_async_rw take care of iovec
## [1008] 1a2cc0ce8d18 - io_uring: further simplify do_read error parsing
## [1007] 6713e7a6145a - io_uring: refactor io_read for unsupported nowait
## [1006] eeb60b9ab400 - io_uring: refactor io_cqring_wait
## [1005] c1d5a224683b - io_uring: refactor scheduling in io_cqring_wait
## [1004] 9936c7c2bc76 - io_uring: deduplicate core cancellations sequence
## [1003] d7e10d47691d - io_uring: don't modify identity's files uncess identity is cowed
## [1002] 57cd657b8272 - io_uring: simplify do_read return parsing
## [1001] ce3d5aae331f - io_uring: deduplicate adding to REQ_F_INFLIGHT
## [1000] e86d004729ae - io_uring: remove work flags after cleanup
## [999] 34e08fed2c1c - io_uring: inline io_req_drop_files()
## [998] ba13e23f37c7 - io_uring: kill not used needs_file_no_error
## [997] 9ae1f8dd372e - io_uring: fix inconsistent lock state
## [996] 13770a71ed35 - io_uring: Fix NULL dereference in error in io_sqe_files_register()
## [995] 8b28fdf21193 - io_uring: check kthread parked flag before sqthread goes to sleep
## [994] 090da7d52fe2 - MAINTAINERS: update io_uring section
## [993] 4e0377a1c5c6 - io_uring: Add skip option for __io_sqe_files_update
## [992] 67973b933e34 - io_uring: cleanup files_update looping
## [991] 7c6607313f03 - io_uring: consolidate putting reqs task
## [990] ecfc84928207 - io_uring: ensure only sqo_task has file notes
## [989] 0bead8cd39b9 - io_uring: simplify io_remove_personalities()
## [988] 4014d943cb62 - io_uring/io-wq: kill off now unused IO_WQ_WORK_NO_CANCEL
## [987] 9eac1904d336 - io_uring: get rid of intermediate IORING_OP_CLOSE stage
## [986] e342c807f556 - io_uring: save atomic dec for inline executed reqs
## [985] 9affd664f0e0 - io_uring: don't flush CQEs deep down the stack
## [984] a38d68db6742 - io_uring: help inlining of io_req_complete()
## [983] 8662daec09ed - io_uring: add a helper timeout mode calculation
## [982] eab30c4d20dc - io_uring: deduplicate failing task_work_add
## [981] 02b23a9af5ba - io_uring: remove __io_state_file_put
## [980] 85bcb6c67ea1 - io_uring: simplify io_alloc_req()
## [979] 888aae2eeddf - io_uring: further deduplicate #CQ events calc
## [978] ec30e04ba4a5 - io_uring: inline __io_commit_cqring()
## [977] 2d7e935809b7 - io_uring: inline io_async_submit()
## [976] 5c766a908d06 - io_uring: cleanup personalities under uring_lock
## [975] dc2a6e9aa9c3 - io_uring: refactor io_resubmit_prep()
## [974] bf6182b6d46e - io_uring: optimise io_rw_reissue()
## [973] 00835dce1406 - io_uring: make percpu_ref_release names consistent
## [972] 1ad555c6ae6e - io_uring: create common fixed_rsrc_data allocation routines
## [971] d7954b2ba946 - io_uring: create common fixed_rsrc_ref_node handling routines
## [970] bc9744cd162b - io_uring: split ref_node alloc and init
## [969] 6802535df7bf - io_uring: split alloc_fixed_file_ref_node
## [968] 2a63b2d9c30b - io_uring: add rsrc_ref locking routines
## [967] d67d2263fb23 - io_uring: separate ref_list from fixed_rsrc_data
## [966] 502385318369 - io_uring: generalize io_queue_rsrc_removal
## [965] 269bbe5fd4d2 - io_uring: rename file related variables to rsrc
## [964] 2b358604aa6e - io_uring: modularize io_sqe_buffers_register
## [963] 0a96bbe49994 - io_uring: modularize io_sqe_buffer_register
## [962] 3a81fd02045c - io_uring: enable LOOKUP_CACHED path resolution for filename lookups
## [961] 9c83465f3245 - tomoyo: recognize kernel threads correctly
## [960] 3a7efd1ad269 - io_uring: reinforce cancel on flush during exit
## [959] 70b2c60d3797 - io_uring: fix sqo ownership false positive warning
## [958] f609cbb8911e - io_uring: fix list corruption for splice file_get
## [957] 1875dc5b8ff4 - sched: Correctly sort struct predeclarations
## [956] 6195ba09822c - io_uring: fix flush cqring overflow list while TASK_INTERRUPTIBLE
## [955] 907d1df30a51 - io_uring: fix wqe->lock/completion_lock deadlock
## [954] ca70f00bed6c - io_uring: fix cancellation taking mutex while TASK_UNINTERRUPTIBLE
## [953] a1bb3cd58913 - io_uring: fix __io_uring_files_cancel() with TASK_UNINTERRUPTIBLE
## [952] b18032bb0a88 - io_uring: only call io_cqring_ev_posted() if events were posted
## [951] 84965ff8a84f - io_uring: if we see flush on exit, cancel related tasks
## [950] 02a13674fa0e - io_uring: account io_uring internal files as REQ_F_INFLIGHT
## [949] 9d5c8190683a - io_uring: fix sleeping under spin in __io_clean_op
## [948] ae29e4220fd3 - xfs: reduce ilock acquisitions in xfs_file_fsync
## [947] 9a173346bd9e - io_uring: fix short read retries for non-reg files
## [946] 607ec89ed18f - io_uring: fix SQPOLL IORING_OP_CLOSE cancelation state
## [945] ac687e6e8c26 - kthread: Extract KTHREAD_IS_PER_CPU
## [944] 0b5cd6c32b14 - io_uring: fix skipping disabling sqo on exec
## [943] 4325cb498cb7 - io_uring: fix uring_flush in exit_files() warning
## [942] 6b393a1ff174 - io_uring: fix false positive sqo warning on flush
## [941] c93cc9e16d88 - io_uring: iopoll requests should also wake task ->in_idle state
## [940] a8d13dbccb13 - io_uring: ensure finish_wait() is always called in __io_uring_task_cancel()
## [939] f010505b78a4 - io_uring: flush timeouts that should already have expired
## [938] 06585c497b55 - io_uring: do sqo disable on install_fd error
## [937] b4411616c26f - io_uring: fix null-deref in io_disable_sqo_submit
## [936] 621fadc22365 - io_uring: don't take files/mm for a dead task
## [935] d434ab6db524 - io_uring: drop mm and files after task_work_run
## [934] d9d05217cb69 - io_uring: stop SQPOLL submit on creator's death
## [933] 6b5733eb638b - io_uring: add warn_once for io_uring_flush()
## [932] 4f793dc40bc6 - io_uring: inline io_uring_attempt_task_drop()
## [931] 55e6ac1e1f31 - io_uring: io_rw_reissue lockdep annotations
## [930] b1445e59cc9a - io_uring: synchronise ev_posted() with waitqueues
## [929] 4aa84f2ffa81 - io_uring: dont kill fasync under completion_lock
## [928] 80c18e4ac20c - io_uring: trigger eventfd for IOPOLL
## [927] 3e2224c5867f - io_uring: Fix return value from alloc_fixed_file_ref_node
## [926] 170b3bbda088 - io_uring: Delete useless variable ‘id’ in io_prep_async_work
## [925] 90df08538c07 - io_uring: cancel more aggressively in exit_work
## [924] de7f1d9e99d8 - io_uring: drop file refs after task cancel
## [923] 6c503150ae33 - io_uring: patch up IOPOLL overflow_flush sync
## [922] 81b6d05ccad4 - io_uring: synchronise IOPOLL on task_submit fail
## [921] 6c6ec2b0a3e0 - fs: add support for LOOKUP_CACHED
## [920] b1b6b5a30dce - kernel/io_uring: cancel io_uring before task works
## [919] 1ffc54220c44 - io_uring: fix io_sqe_files_unregister() hangs
## [918] 1642b4450d20 - io_uring: add a helper for setting a ref node
## [917] 77788775c713 - io_uring: don't assume mm is constant across submits
## [916] c07e6719511e - io_uring: hold uring_lock while completing failed polled io in io_wq_submit_work()
## [915] 9faadcc8abe4 - io_uring: fix double io_uring free
## [914] 942cb357ae7d - Smack: Handle io_uring kernel thread privileges
## [913] a528b04ea406 - io_uring: fix ignoring xa_store errors
## [912] f57555eda979 - io_uring: end waiting before task cancel attempts
## [911] 55583d72e230 - io_uring: always progress task_work on task cancel
## [910] 446bc1c20733 - io-wq: kill now unused io_wq_cancel_all()
## [909] 00c18640c243 - io_uring: make ctx cancel on exit targeted to actual ctx
## [908] dd2016623695 - io_uring: fix 0-iov read buffer select
## [907] dfea9fce29fd - io_uring: close a small race gap for files cancel
## [906] 0020ef04e485 - io_uring: fix io_wqe->work_list corruption
## [905] 89448c47b845 - io_uring: limit {io|sq}poll submit locking scope
## [904] 09e88404f46c - io_uring: inline io_cqring_mark_overflow()
## [903] e23de15fdbd3 - io_uring: consolidate CQ nr events calculation
## [902] 9cd2be519d05 - io_uring: remove racy overflow list fast checks
## [901] cda286f0715c - io_uring: cancel reqs shouldn't kill overflow list
## [900] 4bc4a912534a - io_uring: hold mmap_sem for mm->locked_vm manipulation
## [899] a146468d76e0 - io_uring: break links on shutdown failure
## [898] 355fb9e2b78e - io_uring: remove 'twa_signal_ok' deadlock work-around
## [897] 792ee0f6db5b - io_uring: JOBCTL_TASK_WORK is no longer used by task_work
## [896] 9ee1206dcfb9 - exec: Move io_uring_task_cancel after the point of no return
## [895] 59850d226e49 - io_uring: fix io_cqring_events()'s noflush
## [894] 634578f80065 - io_uring: fix racy IOPOLL flush overflow
## [893] 31bff9a51b26 - io_uring: fix racy IOPOLL completions
## [892] dad1b1242fd5 - io_uring: always let io_iopoll_complete() complete polled io
## [891] 9c8e11b36c9b - io_uring: add timeout update
## [890] fbd15848f3c1 - io_uring: restructure io_timeout_cancel()
## [889] bee749b187ac - io_uring: fix files cancellation
## [888] ac0648a56c1f - io_uring: use bottom half safe lock for fixed file data
## [887] bd5bbda72f7f - io_uring: fix miscounting ios_left
## [886] 6e1271e60c1d - io_uring: change submit file state invariant
## [885] 65b2b213484a - io_uring: check kthread stopped flag when sq thread is unparked
## [884] 36f72fe2792c - io_uring: share fixed_file_refs b/w multiple rsrcs
## [883] c98de08c990e - io_uring: replace inflight_wait with tctx->wait
## [882] 10cad2c40dcb - io_uring: don't take fs for recvmsg/sendmsg
## [881] 2e9dbe902d10 - io_uring: only wake up sq thread while current task is in io worker context
## [880] 906a3c6f9ca0 - io_uring: don't acquire uring_lock twice
## [879] a0d9205f7d36 - io_uring: initialize 'timeout' properly in io_sq_thread()
## [878] 083692463440 - io_uring: refactor io_sq_thread() handling
## [877] f6edbabb8359 - io_uring: always batch cancel in *cancel_files()
## [876] 6b81928d4ca8 - io_uring: pass files into kill timeouts/poll
## [875] b52fda00dd9d - io_uring: don't iterate io_uring_cancel_files()
## [874] df9923f96717 - io_uring: cancel only requests of current task
## [873] 08d23634643c - io_uring: add a {task,files} pair matching helper
## [872] 06de5f5973c6 - io_uring: simplify io_task_match()
## [871] 2846c481c9dd - io_uring: inline io_import_iovec()
## [870] 632546c4b5a4 - io_uring: remove duplicated io_size from rw
## [869] 10fc72e43352 - fs/io_uring Don't use the return value from import_iovec().
## [868] 1a38ffc9cbca - io_uring: NULL files dereference by SQPOLL
## [867] c73ebb685fb6 - io_uring: add timeout support for io_uring_enter()
## [866] 27926b683db0 - io_uring: only plug when appropriate
## [865] 0415767e7f05 - io_uring: rearrange io_kiocb fields for better caching
## [864] f2f87370bb66 - io_uring: link requests with singly linked list
## [863] 90cd7e424969 - io_uring: track link timeout's master explicitly
## [862] 863e05604a6f - io_uring: track link's head and tail during submit
## [861] 018043be1f1b - io_uring: split poll and poll_remove structs
## [860] 14a1143b68ee - io_uring: add support for IORING_OP_UNLINKAT
## [859] 80a261fd0032 - io_uring: add support for IORING_OP_RENAMEAT
## [858] 14587a46646d - io_uring: enable file table usage for SQPOLL rings
## [857] 28cea78af449 - io_uring: allow non-fixed files with SQPOLL
## [856] f26c08b444df - io_uring: fix file leak on error path of io ctx creation
## [855] e8c954df2341 - io_uring: fix mis-seting personality's creds
## [854] 2d280bc8930b - io_uring: fix recvmsg setup with compat buf-select
## [853] af60470347de - io_uring: fix files grab/cancel race
## [852] 9c3a205c5ffa - io_uring: fix ITER_BVEC check
## [851] eb2667b34336 - io_uring: fix shift-out-of-bounds when round up cq size
## [850] 36f4fa6886a8 - io_uring: add support for shutdown(2)
## [849] b713c195d593 - net: provide __sys_shutdown_sock() that takes a socket
## [848] ce59fc69b1c2 - io_uring: allow SQPOLL with CAP_SYS_NICE privileges
## [847] e297822b20e7 - io_uring: order refnode recycling
## [846] 1e5d770bb8a2 - io_uring: get an active ref_node from files_data
## [845] c993df5a6889 - io_uring: don't double complete failed reissue request
## [844] 944d1444d53f - io_uring: handle -EOPNOTSUPP on path resolution
## [843] 88ec3211e463 - io_uring: round-up cq size before comparing with rounded sq size
## [842] 9a472ef7a369 - io_uring: fix link lookup racing with link timeout
## [841] 6b47ab81c9a9 - io_uring: use correct pointer for io_uring_show_cred()
## [840] ef9865a44228 - io_uring: don't forget to task-cancel drained reqs
## [839] 99b328084f6a - io_uring: fix overflowed cancel w/ linked ->files
## [838] cb8a8ae31074 - io_uring: drop req/tctx io_identity separately
## [837] 4b70cf9dea4c - io_uring: ensure consistent view of original task ->mm from SQPOLL
## [836] fdaf083cdfb5 - io_uring: properly handle SQPOLL request cancelations
## [835] 114518eb6430 - task_work: Use TIF_NOTIFY_SIGNAL if available
## [834] c8b5e2600a2c - io_uring: use type appropriate io_kiocb handler for double poll
## [833] 0d63c148d6d9 - io_uring: simplify __io_queue_sqe()
## [832] 9aaf354352f1 - io_uring: simplify nxt propagation in io_queue_sqe
## [831] feaadc4fc2eb - io_uring: don't miss setting IO_WQ_WORK_CONCURRENT
## [830] c9abd7ad832b - io_uring: don't defer put of cancelled ltimeout
## [829] cdfcc3ee0459 - io_uring: always clear LINK_TIMEOUT after cancel
## [828] ac877d2edd09 - io_uring: don't adjust LINK_HEAD in cancel ltimeout
## [827] e08102d507f3 - io_uring: remove opcode check on ltimeout kill
## [826] ee6e00c86822 - splice: change exported internal do_splice() helper to take kernel offset
## [825] 4017eb91a9e7 - io_uring: make loop_rw_iter() use original user supplied pointers
## [824] c8fb20b5b420 - io_uring: remove req cancel in ->flush()
## [823] ff5771613cd7 - io_uring: don't reuse linked_timeout
## [822] 69228338c9c3 - io_uring: unify fsize with def->work_flags
## [821] 900fad45dc75 - io_uring: fix racy REQ_F_LINK_TIMEOUT clearing
## [820] 4d52f338992b - io_uring: do poll's hash_node init in common code
## [819] dd221f46f68a - io_uring: inline io_poll_task_handler()
## [818] 069b89384d77 - io_uring: remove extra ->file check in poll prep
## [817] 2c3bac6dd6c7 - io_uring: make cached_cq_overflow non atomic_t
## [816] d148ca4b07d0 - io_uring: inline io_fail_links()
## [815] ec99ca6c4747 - io_uring: kill ref get/drop in personality init
## [814] 2e5aa6cb4d15 - io_uring: flags-based creds init in queue
## [813] 9ba0d0c81284 - io_uring: use blk_queue_nowait() to check if NOWAIT supported
## [812] 0726b01e7045 - mm/madvise: pass mm to do_madvise
## [811] 58852d4d6737 - io_uring: fix double poll mask init
## [810] d8a6df10aac9 - io_uring: use percpu counters to track inflight requests
## [809] 500a373d731a - io_uring: assign new io_identity for task if members have changed
## [808] 5c3462cfd123 - io_uring: store io_identity in io_uring_task
## [807] 1e6fa5216a0e - io_uring: COW io_identity on mismatch
## [806] 98447d65b4a7 - io_uring: move io identity items into separate struct
## [805] dfead8a8e2c4 - io_uring: rely solely on work flags to determine personality.
## [804] 0f203765880c - io_uring: pass required context in as flags
## [803] 55cbc2564ab2 - io_uring: fix error path cleanup in io_sqe_files_register()
## [802] 0918682be432 - Revert "io_uring: mark io_uring_fops/io_op_defs as __read_mostly"
## [801] 216578e55ac9 - io_uring: fix REQ_F_COMP_LOCKED by killing it
## [800] 4edf20f99902 - io_uring: dig out COMP_LOCK from deep call chain
## [799] 6a0af224c213 - io_uring: don't put a poll req under spinlock
## [798] b1b74cfc1967 - io_uring: don't unnecessarily clear F_LINK_TIMEOUT
## [797] 368c5481ae7c - io_uring: don't set COMP_LOCKED if won't put
## [796] 035fbafc7a54 - io_uring: Fix sizeof() mismatch
## [795] b2e968528312 - io_uring: keep a pointer ref_node in file_data
## [794] 600cf3f8b3f6 - io_uring: refactor *files_register()'s error paths
## [793] 5398ae698525 - io_uring: clean file_data access in files_register
## [792] 692d836351ff - io_uring: don't delay io_init_req() error check
## [791] 062d04d73168 - io_uring: clean leftovers after splitting issue
## [790] a71976f3fa47 - io_uring: remove timeout.list after hrtimer cancel
## [789] 0bdf7a2ddb7d - io_uring: use a separate struct for timeout_remove
## [788] 71b547c048eb - io_uring: improve submit_state.ios_left accounting
## [787] 8371adf53c3c - io_uring: simplify io_file_get()
## [786] 479f517be571 - io_uring: kill extra check in fixed io_file_get()
## [785] 233295130e53 - io_uring: clean up ->files grabbing
## [784] 5bf5e464f1ac - io_uring: don't io_prep_async_work() linked reqs
## [783] 5e2ed8c4f450 - io_uring: Convert advanced XArray uses to the normal API
## [782] 236434c3438c - io_uring: Fix XArray usage in io_uring_add_task_file
## [781] ce765372bc44 - io_uring: Fix use of XArray in __io_uring_files_cancel
## [780] ed6930c9201c - io_uring: fix break condition for __io_uring_register() waiting
## [779] ca6484cd308a - io_uring: no need to call xa_destroy() on empty xarray
## [778] faf7b51c0697 - io_uring: batch account ->req_issue and task struct references
## [777] 87c4311fd2c2 - io_uring: kill callback_head argument for io_req_task_work_add()
## [776] c1379e247a72 - io_uring: move req preps out of io_issue_sqe()
## [775] bfe76559833d - io_uring: decouple issuing and req preparation
## [774] 73debe68b300 - io_uring: remove nonblock arg from io_{rw}_prep()
## [773] a88fc400212f - io_uring: set/clear IOCB_NOWAIT into io_read/write
## [772] 2d199895d231 - io_uring: remove F_NEED_CLEANUP check in *prep()
## [771] 5b09e37e27a8 - io_uring: io_kiocb_ppos() style change
## [770] 291b2821e072 - io_uring: simplify io_alloc_req()
## [769] c4068bf898dd - io-wq: fix use-after-free in io_wq_worker_running
## [768] dbbe9c642411 - io_uring: show sqthread pid and cpu in fdinfo
## [767] af9c1a44f8de - io_uring: process task work in io_uring_register()
## [766] 91d8f5191e8f - io_uring: add blkcg accounting to offloaded operations
## [765] de2939388be5 - io_uring: improve registered buffer accounting for huge pages
## [764] 14db84110d48 - io_uring: remove unneeded semicolon
## [763] e95eee2dee78 - io_uring: cap SQ submit size for SQPOLL with multiple rings
## [762] e8c2bc1fb6c9 - io_uring: get rid of req->io/io_async_ctx union
## [761] 4be1c6151269 - io_uring: kill extra user_bufs check
## [760] ab0b196ce555 - io_uring: fix overlapped memcpy in io_req_map_rw()
## [759] afb87658f89b - io_uring: refactor io_req_map_rw()
## [758] f4bff104fffb - io_uring: simplify io_rw_prep_async()
## [757] 90554200724d - io_uring: provide IORING_ENTER_SQ_WAIT for SQPOLL SQ ring waits
## [756] 738277adc819 - io_uring: mark io_uring_fops/io_op_defs as __read_mostly
## [755] aa06165de863 - io_uring: enable IORING_SETUP_ATTACH_WQ to attach to SQPOLL thread too
## [754] 69fb21310fd3 - io_uring: base SQPOLL handling off io_sq_data
## [753] 534ca6d684f1 - io_uring: split SQPOLL data into separate structure
## [752] c8d1ba583fe6 - io_uring: split work handling part of SQPOLL into helper
## [751] 3f0e64d05411 - io_uring: move SQPOLL post-wakeup ring need wakeup flag into wake handler
## [750] 6a7793828fb2 - io_uring: use private ctx wait queue entries for SQPOLL
## [749] e35afcf91230 - io_uring: io_sq_thread() doesn't need to flush signals
## [748] 95da84659226 - io_wq: Make io_wqe::lock a raw_spinlock_t
## [747] 7e84e1c7566a - io_uring: allow disabling rings during the creation
## [746] 21b55dbc0653 - io_uring: add IOURING_REGISTER_RESTRICTIONS opcode
## [745] 9d4a75efa200 - io_uring: use an enumeration for io_uring_register(2) opcodes
## [744] a3ec60054082 - io_uring: move io_uring_get_socket() into io_uring.h
## [743] 9b8284921513 - io_uring: reference ->nsproxy for file table commands
## [742] 0f2122045b94 - io_uring: don't rely on weak ->files references
## [741] e6c8aa9ac33b - io_uring: enable task/files specific overflow flushing
## [740] 76e1b6427fd8 - io_uring: return cancelation status from poll/timeout/files handlers
## [739] e3bc8e9dad7f - io_uring: unconditionally grab req->task
## [738] 2aede0e417db - io_uring: stash ctx task reference for SQPOLL
## [737] f573d384456b - io_uring: move dropping of files into separate helper
## [736] f3606e3a92dd - io_uring: allow timeout/poll/files killing to take task into account
## [735] c8d317aa1887 - io_uring: fix async buffered reads when readahead is disabled
## [734] fad8e0de4426 - io_uring: fix potential ABBA deadlock in ->show_fdinfo()
## [733] 8706e04ed7d6 - io_uring: always delete double poll wait entry on match
## [732] f38c7e3abfba - io_uring: ensure async buffered read-retry is setup properly
## [731] 62c774ed4831 - io_uring: don't unconditionally set plug->nowait = true
## [730] f3cd4850504f - io_uring: ensure open/openat2 name is cleaned on cancelation
## [729] 4eb8dded6b82 - io_uring: fix openat/openat2 unified prep handling
## [728] 6ca56f845955 - io_uring: mark statx/files_update/epoll_ctl as non-SQPOLL
## [727] 72f04da48a98 - tools/io_uring: fix compile breakage
## [726] f5cac8b156e8 - io_uring: don't use retry based buffered reads for non-async bdev
## [725] 8f3d749685e4 - io_uring: don't re-setup vecs/iter in io_resumit_prep() is already there
## [724] a665eec0a22e - powerpc/64s/radix: Fix mm_cpumask trimming race vs kthread_use_mm
## [723] bafb056ce279 - sparc64: remove mm_cpumask clearing to fix kthread_use_mm race
## [722] 6200b0ae4ea2 - io_uring: don't run task work on an exiting task
## [721] 87ceb6a6b81e - io_uring: drop 'ctx' ref on task work cancelation
## [720] 202700e18acb - io_uring: grab any needed state during defer prep
## [719] c127a2a1b7ba - io_uring: fix linked deferred ->files cancellation
## [718] b7ddce3cbf01 - io_uring: fix cancel of deferred reqs with ->files
## [717] c183edff33fd - io_uring: fix explicit async read/write mapping for large segments
## [716] 355afaeb578a - io_uring: no read/write-retry on -EAGAIN error and O_NONBLOCK marked file
## [715] 95d1c8e5f801 - io_uring: set table->files[i] to NULL when io_sqe_file_register failed
## [714] 98dfd5024a2e - io_uring: fix removing the wrong file in __io_sqe_files_update()
## [713] fdee946d0925 - io_uring: don't bounce block based -EAGAIN retry off task_work
## [712] eefdf30f3dcb - io_uring: fix IOPOLL -EAGAIN retries
## [711] 56450c20fe10 - io_uring: clear req->result on IOPOLL re-issue
## [710] 0fef948363f6 - io_uring: make offset == -1 consistent with preadv2/pwritev2
## [709] 00d23d516e2e - io_uring: ensure read requests go through -ERESTART* transformation
## [708] 9dab14b81807 - io_uring: don't use poll handler if file can't be nonblocking read/written
## [707] 6b7898eb180d - io_uring: fix imbalanced sqo_mm accounting
## [706] 842163154b87 - io_uring: revert consumed iov_iter bytes on error
## [705] 901341bb9718 - io_uring: ignore POLLIN for recvmsg on MSG_ERRQUEUE
## [704] 583bbf0624df - io_uring: allow tcp ancillary data for __sys_recvmsg_sock()
## [703] fd7d6de22414 - io_uring: don't recurse on tsk->sighand->siglock with signalfd
## [702] 867a23eab528 - io_uring: kill extra iovec=NULL in import_iovec()
## [701] f261c16861b8 - io_uring: comment on kfree(iovec) checks
## [700] bb175342aa64 - io_uring: fix racy req->flags modification
## [699] fc666777da9d - io_uring: use system_unbound_wq for ring exit work
## [698] 8452fd0ce657 - io_uring: cleanup io_import_iovec() of pre-mapped request
## [697] 3b2a4439e0ae - io_uring: get rid of kiocb_wait_page_queue_init()
## [696] b711d4eaf0c4 - io_uring: find and cancel head link async work on files exit
## [695] f91daf565b0e - io_uring: short circuit -EAGAIN for blocking read attempt
## [694] d4e7cd36a90e - io_uring: sanitize double poll handling
## [693] 227c0c9673d8 - io_uring: internally retry short reads
## [692] ff6165b2d7f6 - io_uring: retain iov_iter state over io_read/io_write calls
## [691] ebf0d100df07 - task_work: only grab task signal lock when needed
## [690] f254ac04c874 - io_uring: enable lookup of links holding inflight files
## [689] a36da65c4656 - io_uring: fail poll arm on queue proc failure
## [688] 6d816e088c35 - io_uring: hold 'ctx' reference around task_work queue + execute
## [687] 51a4cc112c7a - io_uring: defer file table grabbing request cleanup for locked requests
## [686] 9b7adba9eaec - io_uring: add missing REQ_F_COMP_LOCKED for nested requests
## [685] 7271ef3a93a8 - io_uring: fix recursive completion locking on oveflow flush
## [684] 0ba9c9edcd15 - io_uring: use TWA_SIGNAL for task_work uncondtionally
## [683] f74441e6311a - io_uring: account locked memory before potential error case
## [682] bd74048108c1 - io_uring: set ctx sq/cq entry count earlier
## [681] 2dd2111d0d38 - io_uring: Fix NULL pointer dereference in loop_rw_iter()
## [680] c1dd91d16246 - io_uring: add comments on how the async buffered read retry works
## [679] cbd287c09351 - io_uring: io_async_buf_func() need not test page bit
## [678] fa15bafb71fd - io_uring: flip if handling after io_setup_async_rw
## [677] d1719f70d0a5 - io_uring: don't touch 'ctx' after installing file descriptor
## [676] 01cec8c18f5a - io_uring: get rid of atomic FAA for cq_timeouts
## [675] 469301434080 - io_uring: consolidate *_check_overflow accounting
## [674] dd9dfcdf5a60 - io_uring: fix stalled deferred requests
## [673] b2bd1cf99f3e - io_uring: fix racy overflow count reporting
## [672] 81b68a5ca0ab - io_uring: deduplicate __io_complete_rw()
## [671] 010e8e6be219 - io_uring: de-unionise io_kiocb
## [670] f063c5477eb3 - io_uring: fix missing io_queue_linked_timeout()
## [669] b65e0dd6a2de - io_uring: mark ->work uninitialised after cleanup
## [668] f56040b81999 - io_uring: deduplicate io_grab_files() calls
## [667] ae34817bd93e - io_uring: don't do opcode prep twice
## [666] 23b3628e4592 - io_uring: clear IORING_SQ_NEED_WAKEUP after executing task works
## [665] 5af1d13e8f0d - io_uring: batch put_task_struct()
## [664] cbcf72148da4 - io_uring: return locked and pinned page accounting
## [663] 5dbcad51f784 - io_uring: don't miscount pinned memory
## [662] 7fbb1b541f42 - io_uring: don't open-code recv kbuf managment
## [661] 8ff069bf2efd - io_uring: extract io_put_kbuf() helper
## [660] bc02ef3325e3 - io_uring: move BUFFER_SELECT check into *recv[msg]
## [659] 0e1b6fe3d1e5 - io_uring: free selected-bufs if error'ed
## [658] 14c32eee9286 - io_uring: don't forget cflags in io_recv()
## [657] 6b754c8b912a - io_uring: remove extra checks in send/recv
## [656] 7a7cacba8b45 - io_uring: indent left {send,recv}[msg]()
## [655] 06ef3608b0ee - io_uring: simplify file ref tracking in submission state
## [654] 57f1a6495854 - io_uring/io-wq: move RLIMIT_FSIZE to io-wq
## [653] 327d6d968b19 - io_uring: alloc ->io in io_req_defer_prep()
## [652] 1c2da9e8839d - io_uring: remove empty cleanup of OP_OPEN* reqs
## [651] dca9cf8b87f5 - io_uring: inline io_req_work_grab_env()
## [650] 0f7e466b393a - io_uring: place cflags into completion data
## [649] 9cf7c104deae - io_uring: remove sequence from io_kiocb
## [648] 27dc8338e5fb - io_uring: use non-intrusive list for defer
## [647] 7d6ddea6beaf - io_uring: remove init for unused list
## [646] 135fcde8496b - io_uring: add req->timeout.list
## [645] 40d8ddd4facb - io_uring: use completion list for CQ overflow
## [644] d21ffe7eca82 - io_uring: use inflight_entry list for iopoll'ing
## [643] 540e32a0855e - io_uring: rename ctx->poll into ctx->iopoll
## [642] 3ca405ebfc1c - io_uring: share completion list w/ per-op space
## [641] 252917c30f55 - io_uring: follow **iovec idiom in io_import_iovec
## [640] c3e330a49374 - io_uring: add a helper for async rw iovec prep
## [639] b64e3444d4e1 - io_uring: simplify io_req_map_rw()
## [638] e73751225bae - io_uring: replace rw->task_work with rq->task_work
## [637] 2ae523ed07f1 - io_uring: extract io_sendmsg_copy_hdr()
## [636] 1400e69705ba - io_uring: use more specific type in rcv/snd msg cp
## [635] 270a5940700b - io_uring: rename sr->msg into umsg
## [634] b36200f543ff - io_uring: fix sq array offset calculation
## [633] 4ae6dbd68386 - io_uring: fix lockup in io_fail_links()
## [632] d5e16d8e2382 - io_uring: fix ->work corruption with poll_add
## [631] 3e863ea3bb1a - io_uring: missed req_init_async() for IOSQE_ASYNC
## [630] 61710e437f28 - io_uring: always allow drain/link/hardlink/async sqe flags
## [629] 807abcb08834 - io_uring: ensure double poll additions work with both request types
## [628] 681fda8d27a6 - io_uring: fix recvmsg memory leak with buffer selection
## [627] 16d598030a37 - io_uring: fix not initialised work->flags
## [626] dd821e0c95a6 - io_uring: fix missing msg_name assignment
## [625] 309fc03a3284 - io_uring: account user memory freed when exit has been queued
## [624] 667e57da358f - io_uring: fix memleak in io_sqe_files_register()
## [623] 4349f30ecb80 - io_uring: remove dead 'ctx' argument and move forward declaration
## [622] 2bc9930e78fe - io_uring: get rid of __req_need_defer()
## [621] f3bd9dae3708 - io_uring: fix memleak in __io_sqe_files_update()
## [620] 6d5f90490460 - io_uring: export cq overflow status to userspace
## [619] 5acbbc8ed3a9 - io_uring: only call kfree() for a non-zero pointer
## [618] aa340845ae6f - io_uring: fix a use after free in io_async_task_func()
## [617] b2edc0a77fac - io_uring: don't burn CPU for iopoll on exit
## [616] 7668b92a69b8 - io_uring: remove nr_events arg from iopoll_check()
## [615] 9dedd5630156 - io_uring: partially inline io_iopoll_getevents()
## [614] 3fcee5a6d541 - io_uring: briefly loose locks while reaping events
## [613] eba0a4dd2aa5 - io_uring: fix stopping iopoll'ing too early
## [612] 3aadc23e6054 - io_uring: don't delay iopoll'ed req completion
## [611] 8b3656af2a37 - io_uring: fix lost cqe->flags
## [610] 652532ad4595 - io_uring: keep queue_sqe()'s fail path separately
## [609] 6df1db6b5424 - io_uring: fix mis-refcounting linked timeouts
## [608] c2c4c83c58cb - io_uring: use new io_req_task_work_add() helper throughout
## [607] 4c6e277c4cc4 - io_uring: abstract out task work running
## [606] b7db41c9e03b - io_uring: fix regression with always ignoring signals in io_cqring_wait()
## [605] ce593a6c480a - io_uring: use signal based task_work running
## [604] 8eb06d7e8dd8 - io_uring: fix missing ->mm on exit
## [603] 3fa5e0f33128 - io_uring: optimise io_req_find_next() fast check
## [602] 0be0b0e33b0b - io_uring: simplify io_async_task_func()
## [601] ea1164e574e9 - io_uring: fix NULL mm in io_poll_task_func()
## [600] cf2f54255d03 - io_uring: don't fail iopoll requeue without ->mm
## [599] ab0b6451db2a - io_uring: clean up io_kill_linked_timeout() locking
## [598] cbdcb4357c00 - io_uring: do grab_env() just before punting
## [597] debb85f496c9 - io_uring: factor out grab_env() from defer_prep()
## [596] edcdfcc149a8 - io_uring: do init work in grab_env()
## [595] 351fd53595a3 - io_uring: don't pass def into io_req_work_grab_env
## [594] ecfc51777487 - io_uring: fix potential use after free on fallback request free
## [593] 8eb7e2d00763 - io_uring: kill REQ_F_TIMEOUT_NOSEQ
## [592] a1a4661691c5 - io_uring: kill REQ_F_TIMEOUT
## [591] 9b5f7bd93272 - io_uring: replace find_next() out param with ret
## [590] 7c86ffeeed30 - io_uring: deduplicate freeing linked timeouts
## [589] fb49278624f7 - io_uring: fix missing wake_up io_rw_reissue()
## [588] f3a6fa226748 - io_uring: fix iopoll -EAGAIN handling
## [587] 3adfecaa647f - io_uring: do task_work_run() during iopoll
## [586] 6795c5aba247 - io_uring: clean up req->result setting by rw
## [585] 9b0d911acce0 - io_uring: kill REQ_F_LINK_NEXT
## [584] 2d6500d44c13 - io_uring: cosmetic changes for batch free
## [583] c3524383333e - io_uring: batch-free linked requests as well
## [582] 2757a23e7f64 - io_uring: dismantle req early and remove need_iter
## [581] e6543a816edc - io_uring: remove inflight batching in free_many()
## [580] 8c9cb6cd9a46 - io_uring: fix refs underflow in io_iopoll_queue()
## [579] 710c2bfb6647 - io_uring: fix missing io_grab_files()
## [578] a6d45dd0d43e - io_uring: don't mark link's head for_async
## [577] 1bcb8c5d65a8 - io_uring: fix feeding io-wq with uninit reqs
## [576] 906a8c3fdbc3 - io_uring: fix punting req w/o grabbed env
## [575] 8ef77766ba86 - io_uring: fix req->work corruption
## [574] 1e16c2f917a5 - io_uring: fix function args for !CONFIG_NET
## [573] c40f63790ec9 - io_uring: use task_work for links if possible
## [572] a1d7c393c471 - io_uring: enable READ/WRITE to use deferred completions
## [571] 229a7b63507a - io_uring: pass in completion state to appropriate issue side handlers
## [570] f13fad7ba41c - io_uring: pass down completion state on the issue side
## [569] 013538bd65fd - io_uring: add 'io_comp_state' to struct io_submit_state
## [568] e1e16097e265 - io_uring: provide generic io_req_complete() helper
## [567] d3cac64c498c - io_uring: fix NULL-mm for linked reqs
## [566] d60b5fbc1ce8 - io_uring: fix current->mm NULL dereference on exit
## [565] cd664b0e35cb - io_uring: fix hanging iopoll in case of -EAGAIN
## [564] b772f07add1c - io_uring: fix io_sq_thread no schedule when busy
## [563] f6b6c7d6a960 - io_uring: kill NULL checks for submit state
## [562] b90cd197f931 - io_uring: set @poll->file after @poll init
## [561] 24c74678634b - io_uring: remove REQ_F_MUST_PUNT
## [560] 62ef73165091 - io_uring: remove setting REQ_F_MUST_PUNT in rw
## [559] bcf5a06304d6 - io_uring: support true async buffered reads, if file provides it
## [558] b63534c41e20 - io_uring: re-issue block requests that failed because of resources
## [557] 4503b7676a2e - io_uring: catch -EIO from buffered issue request failure
## [556] ac8691c415e0 - io_uring: always plug for any number of IOs
## [555] 2e0464d48f32 - io_uring: separate reporting of ring pages from registered pages
## [554] 309758254ea6 - io_uring: report pinned memory usage
## [553] aad5d8da1b30 - io_uring: rename ctx->account_mem field
## [552] a087e2b51992 - io_uring: add wrappers for memory accounting
## [551] a31eb4a2f165 - io_uring: use EPOLLEXCLUSIVE flag to aoid thundering herd type behavior
## [550] 5769a351b89c - io_uring: change the poll type to be 32-bits
## [549] 6f2cc1664db2 - io_uring: fix possible race condition against REQ_F_NEED_CLEANUP
## [548] 56952e91acc9 - io_uring: reap poll completions while waiting for refs to drop on exit
## [547] 9d8426a09195 - io_uring: acquire 'mm' for task_work for SQPOLL
## [546] bbde017a32b3 - io_uring: add memory barrier to synchronize io_kiocb's result and iopoll_completed
## [545] 2d7d67920e5c - io_uring: don't fail links for EAGAIN error in IOPOLL mode
## [544] 801dd57bd1d8 - io_uring: cancel by ->task not pid
## [543] 4dd2824d6d59 - io_uring: lazy get task
## [542] 67c4d9e693e3 - io_uring: batch cancel in io_uring_cancel_files()
## [541] 44e728b8aae0 - io_uring: cancel all task's requests on exit
## [540] 59960b9deb53 - io_uring: fix lazy work init
## [539] 65a6543da386 - io_uring: fix io_kiocb.flags modification race in IOPOLL mode
## [538] 37c54f9bd486 - kernel: set USER_DS in kthread_use_mm
## [537] e697deed834d - io_uring: check file O_NONBLOCK state for accept
## [536] 405a5d2b2762 - io_uring: avoid unnecessary io_wq_work copy for fast poll feature
## [535] 7cdaf587de7c - io_uring: avoid whole io_wq_work copy for requests completed inline
## [534] c5b856255cbc - io_uring: allow O_NONBLOCK async retry
## [533] f5fa38c59cb0 - io_wq: add per-wq work handler instead of per work
## [532] d4c81f38522f - io_uring: don't arm a timeout through work.func
## [531] ac45abc0e2a8 - io_uring: remove custom ->func handlers
## [530] 3af73b286cce - io_uring: don't derive close state from ->func
## [529] a8c73c1a614f - io_uring: use kvfree() in io_sqe_buffer_register()
## [528] efe68c1ca8f4 - io_uring: validate the full range of provided buffers for access
## [527] dddb3e26f6d8 - io_uring: re-set iov base/len for buffer select retry
## [526] d2b6f48b691e - io_uring: move send/recv IOPOLL check into prep
## [525] ec65fea5a8d7 - io_uring: deduplicate io_openat{,2}_prep()
## [524] 25e72d1012b3 - io_uring: do build_open_how() only once
## [523] 3232dd02af65 - io_uring: fix {SQ,IO}POLL with unsupported opcodes
## [522] fd2206e4e97b - io_uring: disallow close of ring itself
## [521] 457f44363a88 - bpf: Implement BPF ring buffer and verifier support for it
## [520] 7b53d59859bc - io_uring: fix overflowed reqs cancellation
## [519] bfe68a221905 - io_uring: off timeouts based only on completions
## [518] 360428f8c0cd - io_uring: move timeouts flushing to a helper
## [517] b0beb28097fa - Revert "block: end bio with BLK_STS_AGAIN in case of non-mq devs and REQ_NOWAIT"
## [516] 6f88cc176a33 - statx: hide interfaces no longer used by io_uring
## [515] e62753e4e292 - io_uring: call statx directly
## [514] 0018784fc84f - statx: allow system call to be invoked from io_uring
## [513] 1d9e1288039a - io_uring: add io_statx structure
## [512] 0bf0eefdab52 - io_uring: get rid of manual punting in io_close
## [511] 045189452210 - io_uring: separate DRAIN flushing into a cold path
## [510] 56080b02ed6e - io_uring: don't re-read sqe->off in timeout_prep()
## [509] 733f5c95e6fd - io_uring: simplify io_timeout locking
## [508] 4518a3cc273c - io_uring: fix flush req->refs underflow
## [507] 18f855e574d9 - sched/fair: Don't NUMA balance for kthreads
## [506] 6b668c9b7fc6 - io_uring: don't submit sqes when ctx->refs is dying
## [505] d4ae271dfaae - io_uring: reset -EBUSY error when io sq thread is waken up
## [504] b532576ed39e - io_uring: don't add non-IO requests to iopoll pending list
## [503] 4f4eeba87cc7 - io_uring: don't use kiocb.private to store buf_index
## [502] e3aabf9554fd - io_uring: cancel work if task_work_add() fails
## [501] 310672552f4a - io_uring: async task poll trigger cleanup
## [500] 948a7749454b - io_uring: remove dead check in io_splice()
## [499] f2a8d5c7a218 - io_uring: add tee(2) support
## [498] 9dafdfc2f0a3 - splice: export do_tee()
## [497] c11368a57be4 - io_uring: don't repeat valid flag list
## [496] 9f13c35b33fd - io_uring: rename io_file_put()
## [495] 0cdaf760f42e - io_uring: remove req->needs_fixed_files
## [494] 3bfa5bcb26f0 - io_uring: cleanup io_poll_remove_one() logic
## [493] bd2ab18a1d62 - io_uring: fix FORCE_ASYNC req preparation
## [492] 650b548129b6 - io_uring: don't prepare DRAIN reqs twice
## [491] 583863ed9181 - io_uring: initialize ctx->sqo_wait earlier
## [490] 6a4d07cde577 - io_uring: file registration list and lock optimization
## [489] 7e55a19cf6e7 - io_uring: add IORING_CQ_EVENTFD_DISABLED to the CQ ring flags
## [488] 0d9b5b3af134 - io_uring: add 'cq_flags' field for the CQ ring
## [487] 18bceab101ad - io_uring: allow POLL_ADD with double poll_wait() users
## [486] 4a38aed2a0a7 - io_uring: batch reap of dead file registrations
## [485] 0f158b4cf20e - io_uring: name sq thread and ref completions
## [484] 9d9e88a24c1f - io_uring: polled fixed file must go through free iteration
## [483] 8469508951d4 - io_uring: remove duplicate semicolon at the end of line
## [482] c96874265cd0 - io_uring: fix zero len do_splice()
## [481] 7d01bd745a8f - io_uring: remove obsolete 'state' parameter
## [480] 904fbcb115c8 - io_uring: remove 'fd is io_uring' from close path
## [479] 63ff822358b2 - io_uring: don't use 'fd' for openat/openat2/statx
## [478] 90da2e3f25c8 - splice: move f_mode checks to do_{splice,tee}()
## [477] 12aceb89b0bc - eventfd: convert to f_op->read_iter()
## [476] 7f13657d1413 - io_uring: handle -EFAULT properly in io_uring_setup()
## [475] d8f1b9716cfd - io_uring: fix mismatched finish_wait() calls in io_uring_cancel_files()
## [474] 2fb3e82284fc - io_uring: punt splice async because of inode mutex
## [473] 4ee3631451c9 - io_uring: check non-sync defer_list carefully
## [472] 7759a0bfadce - io_uring: fix extra put in sync_file_range()
## [471] 3fd44c86711f - io_uring: use cond_resched() in io_ring_ctx_wait_and_kill()
## [470] dd461af65946 - io_uring: use proper references for fallback_req locking
## [469] 490e89676a52 - io_uring: only force async punt if poll based retry can't handle it
## [468] af197f50ac53 - io_uring: enable poll retry for any file with ->read_iter / ->write_iter
## [467] 5b0bbee4732c - io_uring: statx must grab the file table for valid fd
## [466] bc0c4d1e176e - mm: check that mm is still valid in madvise()
## [465] 44575a67314b - io_uring: only restore req->work for req that needs do completion
## [464] 31af27c7cc9f - io_uring: don't count rqs failed after current one
## [463] b55ce7320049 - io_uring: kill already cached timeout.seq_offset
## [462] 22cad1585c6b - io_uring: fix cached_sq_head in io_timeout()
## [461] 8e2e1faf28b3 - io_uring: only post events in io_poll_remove_all() if we completed some
## [460] 2bae047ec957 - io_uring: io_async_task_func() should check and honor cancelation
## [459] 74ce6ce43d4f - io_uring: check for need to re-wait in polled async handling
## [458] 88357580854a - io_uring: correct O_NONBLOCK check for splice punt
## [457] b1f573bd15fd - io_uring: restore req->work when canceling poll request
## [456] ef4ff581102a - io_uring: move all request init code in one place
## [455] dea3b49c7fb0 - io_uring: keep all sqe->flags in req->flags
## [454] 1d4240cc9e7b - io_uring: early submission req fail code
## [453] bf9c2f1cdcc7 - io_uring: track mm through current->mm
## [452] dccc587f6c07 - io_uring: remove obsolete @mm_fault
## [451] 85faa7b8346e - io_uring: punt final io_ring_ctx wait-and-free to workqueue
## [450] c398ecb3d611 - io_uring: fix fs cleanup on cqe overflow
## [449] 9c280f908711 - io_uring: don't read user-shared sqe flags twice
## [448] 0553b8bda870 - io_uring: remove req init from io_get_req()
## [447] b1e50e549b13 - io_uring: alloc req only after getting sqe
## [446] 709b302faddf - io_uring: simplify io_get_sqring
## [445] 45097daea2f4 - io_uring: do not always copy iovec in io_req_map_rw()
## [444] 08a1d26eb894 - io_uring: ensure openat sets O_LARGEFILE if needed
## [443] f7fe9346869a - io_uring: initialize fixed_file_data lock
## [442] 211fea18a7bb - io_uring: remove redundant variable pointer nxt and io_wq_assign_next call
## [441] 48bdd849e967 - io_uring: fix ctx refcounting in io_submit_sqes()
## [440] 581f98103489 - io_uring: process requests completed with -EAGAIN on poll list
## [439] c336e992cb1c - io_uring: remove bogus RLIMIT_NOFILE check in file registration
## [438] aa96bf8a9ee3 - io_uring: use io-wq manager as backup task if task is exiting
## [437] 3537b6a7c654 - io_uring: grab task reference for poll requests
## [436] a6ba632d2c24 - io_uring: retry poll if we got woken with non-matching mask
## [435] 10bea96dcc13 - io_uring: add missing finish_wait() in io_sq_thread()
## [434] 055895537302 - io_uring: refactor file register/unregister/update handling
## [433] 3d9932a8b240 - io_uring: cleanup io_alloc_async_ctx()
## [432] 40510a639ec0 - nvme-tcp: optimize queue io_cpu assignment for multiple queue maps
## [431] bff6035d0c40 - io_uring: fix missing 'return' in comment
## [430] 4afdb733b160 - io-uring: drop completion when removing file
## [429] 18a542ff19ad - io_uring: Fix ->data corruption on re-enqueue
## [428] 9f5834c868e9 - io_uring: make spdxcheck.py happy
## [427] 4ed734b0d091 - io_uring: honor original task RLIMIT_FSIZE
## [426] 09952e3e7826 - io_uring: make sure accept honor rlimit nofile
## [425] 4022e7af86be - io_uring: make sure openat/openat2 honor rlimit nofile
## [424] f1d96a8fcbbb - io_uring: NULL-deref for IOSQE_{ASYNC,DRAIN}
## [423] 3f9d64415fda - io_uring: fix truncated async read/readv and write/writev retry
## [422] bbbdeb4720a0 - io_uring: dual license io_uring.h uapi header
## [421] 32b2244a840a - io_uring: io_uring_enter(2) don't poll while SETUP_IOPOLL|SETUP_SQPOLL enabled
## [420] 469956e853cc - io_uring: Fix unused function warnings
## [419] 84557871f2ff - io_uring: add end-of-bits marker and build time verify it
## [418] 067524e914cb - io_uring: provide means of removing buffers
## [417] 52de1fe12240 - io_uring: add IOSQE_BUFFER_SELECT support for IORING_OP_RECVMSG
## [416] 4d954c258a0c - io_uring: add IOSQE_BUFFER_SELECT support for IORING_OP_READV
## [415] bcda7baaa3f1 - io_uring: support buffer selection for OP_READ and OP_RECV
## [414] ddf0322db79c - io_uring: add IORING_OP_PROVIDE_BUFFERS
## [413] 805b13adde39 - io_uring: ensure RCU callback ordering with rcu_barrier()
## [412] f0e20b894350 - io_uring: fix lockup with timeouts
## [411] c1e2148f8ecb - io_uring: free fixed_file_data after RCU grace period
## [410] 5a2e745d4d43 - io_uring: buffer registration infrastructure
## [409] e9fd939654f1 - io_uring/io-wq: forward submission ref to async
## [408] 7a743e225b2a - io_uring: get next work with submission ref drop
## [407] 014db0073cc6 - io_uring: remove @nxt from handlers
## [406] 594506fec5fa - io_uring: make submission ref putting consistent
## [405] a2100672f3b2 - io_uring: clean up io_close
## [404] 8755d97a09fe - io_uring: Ensure mask is initialized in io_arm_poll_handler
## [403] 3b17cf5a58f2 - io_uring: remove io_prep_next_work()
## [402] 4bc4494ec7c9 - io_uring: remove extra nxt check after punt
## [401] d7718a9d25a6 - io_uring: use poll driven retry for files that support it
## [400] 8a72758c51f8 - io_uring: mark requests that we can do poll async in io_op_defs
## [399] b41e98524e42 - io_uring: add per-task callback handler
## [398] c2f2eb7d2c1c - io_uring: store io_kiocb in wait->private
## [397] 5eae8619907a - io_uring: remove IO_WQ_WORK_CB
## [396] 02d27d895323 - io_uring: extract kmsg copy helper
## [395] b0a20349f212 - io_uring: clean io_poll_complete
## [394] 7d67af2c0134 - io_uring: add splice(2) support
## [393] 8da11c19940d - io_uring: add interface for getting files
## [392] bcaec089c5b6 - io_uring: remove req->in_async
## [391] deb6dc054488 - io_uring: don't do full *prep_worker() from io-wq
## [390] 5ea62161167e - io_uring: don't call work.func from sync ctx
## [389] e441d1cf20e1 - io_uring: io_accept() should hold on to submit reference on retry
## [388] 29de5f6a3507 - io_uring: consider any io_read/write -EAGAIN as final
## [387] 80ad894382bf - io-wq: remove io_wq_flush and IO_WQ_WORK_INTERNAL
## [386] d87683620489 - io_uring: fix 32-bit compatability with sendmsg/recvmsg
## [385] bebdb65e0772 - io_uring: define and set show_fdinfo only if procfs is enabled
## [384] dd3db2a34cff - io_uring: drop file set ref put/get on switch
## [383] 3a9015988b3d - io_uring: import_single_range() returns 0/-ERROR
## [382] 2a44f4678161 - io_uring: pick up link work on submit reference drop
## [381] bdcd3eab2a9a - io_uring: fix poll_list race for SETUP_IOPOLL|SETUP_SQPOLL
## [380] 41726c9a50e7 - io_uring: fix personality idr leak
## [379] 193155c8c942 - io_uring: handle multiple personalities in link chains
## [378] c7849be9cc2d - io_uring: fix __io_iopoll_check deadlock in io_sq_thread
## [377] 7143b5ac5750 - io_uring: prevent sq_thread from spinning when it should stop
## [376] 929a3af90f0f - io_uring: fix use-after-free by io_cleanup_req()
## [375] 297a31e3e831 - io_uring: remove unnecessary NULL checks
## [374] 7fbeb95d0f68 - io_uring: add missing io_req_cancelled()
## [373] 2ca10259b418 - io_uring: prune request from overflow list on flush
## [372] 7563439adfae - io-wq: don't call kXalloc_node() with non-online node
## [371] b537916ca510 - io_uring: retain sockaddr_storage across send/recvmsg async punt
## [370] 6ab231448fdc - io_uring: cancel pending async work if task exits
## [369] 36282881a795 - io-wq: add io_wq_cancel_pid() to cancel based on a specific pid
## [368] 0bdbdd08a8f9 - io_uring: fix openat/statx's filename leak
## [367] 5f798beaf35d - io_uring: fix double prep iovec leak
## [366] a93b33312f63 - io_uring: fix async close() with f_op->flush()
## [365] 0b5faf6ba7fb - io_uring: allow AT_FDCWD for non-file openat/openat2/statx
## [364] ff002b30181d - io_uring: grab ->fs as part of async preparation
## [363] faac996ccd5d - io_uring: retry raw bdev writes if we hit -EOPNOTSUPP
## [362] 8fef80bf56a4 - io_uring: add cleanup for openat()/statx()
## [361] 99bc4c38537d - io_uring: fix iovec leaks
## [360] e96e977992d0 - io_uring: remove unused struct io_async_open
## [359] 63e5d81f72af - io_uring: flush overflowed CQ events in the io_uring_poll()
## [358] cf3040ca55f2 - io_uring: statx/openat/openat2 don't support fixed files
## [357] 1e95081cb5b4 - io_uring: fix deferred req iovec leak
## [356] e1d85334d623 - io_uring: fix 1-bit bitfields to be unsigned
## [355] 1cb1edb2f5ba - io_uring: get rid of delayed mm check
## [354] 2faf852d1be8 - io_uring: cleanup fixed file data table references
## [353] df069d80c8e3 - io_uring: spin for sq thread to idle on shutdown
## [352] 3e577dcd73a1 - io_uring: put the flag changing code in the same spot
## [351] 6c8a31346925 - io_uring: iterate req cache backwards
## [350] 3e69426da259 - io_uring: punt even fadvise() WILLNEED to async context
## [349] 1a417f4e618e - io_uring: fix sporadic double CQE entry for close
## [348] 9250f9ee194d - io_uring: remove extra ->file check
## [347] 5d204bcfa093 - io_uring: don't map read/write iovec potentially twice
## [346] 0b7b21e42ba2 - io_uring: use the proper helpers for io_send/recv
## [345] f0b493e6b9a8 - io_uring: prevent potential eventfd recursion on poll
## [344] b5e683d5cab8 - eventfd: track eventfd_signal() recursion depth
## [343] 2113b05d039e - fs/io_uring: set FOLL_PIN via pin_user_pages()
## [342] a43e982082c2 - mm/gup: factor out duplicate code from four routines
## [341] d7f62e825fd1 - io_uring: add BUILD_BUG_ON() to assert the layout of struct io_uring_sqe
## [340] 87ce955b24c9 - io_uring: add ->show_fdinfo() for the io_uring file descriptor
## [339] 3e4827b05d2a - io_uring: add support for epoll_ctl(2)
## [338] f86cd20c9454 - io_uring: fix linked command file table usage
## [337] 75c6a03904e0 - io_uring: support using a registered personality for commands
## [336] 071698e13ac6 - io_uring: allow registering credentials
## [335] 24369c2e3bb0 - io_uring: add io-wq workqueue sharing
## [334] cccf0ee83455 - io_uring/io-wq: don't use static creds/mm assignments
## [333] 9466f43741bc - io_uring: fix refcounting with batched allocations at OOM
## [332] 8cdf2193a333 - io_uring: add comment for drain_next
## [331] 980ad26304ab - io_uring: don't attempt to copy iovec for READ/WRITE
## [330] ebe10026210f - io_uring: don't cancel all work on process exit
## [329] 73e08e711d9c - Revert "io_uring: only allow submit from owning task"
## [328] 86a761f81ec8 - io_uring: honor IOSQE_ASYNC for linked reqs
## [327] 1118591ab883 - io_uring: prep req when do IOSQE_ASYNC
## [326] 0463b6c58e55 - io_uring: use labeled array init in io_op_defs
## [325] 6b47ee6ecab1 - io_uring: optimise sqe-to-req flags translation
## [324] 87987898a1db - io_uring: remove REQ_F_IO_DRAINED
## [323] e46a7950d362 - io_uring: file switch work needs to get flushed on exit
## [322] b14cca0c84c7 - io_uring: hide uring_fd in ctx
## [321] 0791015837f1 - io_uring: remove extra check in __io_commit_cqring
## [320] 711be0312df4 - io_uring: optimise use of ctx->drain_next
## [319] 66f4af93da57 - io_uring: add support for probing opcodes
## [318] 10fef4bebf97 - io_uring: account fixed file references correctly in batch
## [317] 354420f705cc - io_uring: add opcode to issue trace event
## [316] cebdb98617ae - io_uring: add support for IORING_OP_OPENAT2
## [315] f8748881b17d - io_uring: remove 'fname' from io_open structure
## [314] c12cedf24e78 - io_uring: add 'struct open_how' to the openat request context
## [313] f2842ab5b72d - io_uring: enable option to only trigger eventfd for async completions
## [312] 69b3e546139a - io_uring: change io_ring_ctx bool fields into bit fields
## [311] c150368b4968 - io_uring: file set registration should use interruptible waits
## [310] 96fd84d83a77 - io_uring: Remove unnecessary null check
## [309] fddafacee287 - io_uring: add support for send(2) and recv(2)
## [308] 2550878f8421 - io_uring: remove extra io_wq_current_is_worker()
## [307] caf582c652fe - io_uring: optimise commit_sqring() for common case
## [306] ee7d46d9db19 - io_uring: optimise head checks in io_get_sqring()
## [305] 9ef4f124894b - io_uring: clamp to_submit in io_submit_sqes()
## [304] 8110c1a6212e - io_uring: add support for IORING_SETUP_CLAMP
## [303] c6ca97b30c47 - io_uring: extend batch freeing to cover more cases
## [302] 8237e045983d - io_uring: wrap multi-req freeing in struct req_batch
## [301] 2b85edfc0c90 - io_uring: batch getting pcpu references
## [300] c1ca757bd6f4 - io_uring: add IORING_OP_MADVISE
## [299] db08ca25253d - mm: make do_madvise() available internally
## [298] 4840e418c2fc - io_uring: add IORING_OP_FADVISE
## [297] ba04291eb66e - io_uring: allow use of offset == -1 to mean file position
## [296] 3a6820f2bb8a - io_uring: add non-vectored read/write commands
## [295] e94f141bd248 - io_uring: improve poll completion performance
## [294] ad3eb2c89fb2 - io_uring: split overflow state into SQ and CQ side
## [293] d3656344fea0 - io_uring: add lookup table for various opcode needs
## [292] add7b6b85a4d - io_uring: remove two unnecessary function declarations
## [291] 32fe525b6d10 - io_uring: move *queue_link_head() from common path
## [290] 9d76377f7e13 - io_uring: rename prev to head
## [289] ce35a47a3a02 - io_uring: add IOSQE_ASYNC
## [288] eddc7ef52a6b - io_uring: add support for IORING_OP_STATX
## [287] 05f3fb3c5397 - io_uring: avoid ring quiesce for fixed file set unregister and update
## [286] b5dba59e0cf7 - io_uring: add support for IORING_OP_CLOSE
## [285] 15b71abe7b52 - io_uring: add support for IORING_OP_OPENAT
## [284] 35cb6d54c1d5 - fs: make build_open_flags() available internally
## [283] d63d1b5edb7b - io_uring: add support for fallocate()
## [282] 1292e972fff2 - io_uring: fix compat for IORING_REGISTER_FILES_UPDATE
## [281] 6b3ad6649a4c - ptrace: reintroduce usage of subjective credentials in ptrace_has_cap()
## [280] 44d282796f81 - io_uring: only allow submit from owning task
## [279] 11ba820bf163 - io_uring: ensure workqueue offload grabs ring mutex for poll list
## [278] 797f3f535d59 - io_uring: clear req->result always before issuing a read/write request
## [277] 78912934f4f7 - io_uring: be consistent in assigning next work from handler
## [276] 74566df3a71c - io_uring: don't setup async context for read/write fixed
## [275] eacc6dfaea96 - io_uring: remove punt of short reads to async context
## [274] 3529d8c2b353 - io_uring: pass in 'sqe' to the prep handlers
## [273] 06b76d44ba25 - io_uring: standardize the prep methods
## [272] 26a61679f10c - io_uring: read 'count' for IORING_OP_TIMEOUT in prep handler
## [271] e47293fdf989 - io_uring: move all prep state for IORING_OP_{SEND,RECV}_MGS to prep handler
## [270] 3fbb51c18f5c - io_uring: move all prep state for IORING_OP_CONNECT to prep handler
## [269] 9adbd45d6d32 - io_uring: add and use struct io_rw for read/writes
## [268] d55e5f5b70dd - io_uring: use u64_to_user_ptr() consistently
## [267] fd6c2e4c063d - io_uring: io_wq_submit_work() should not touch req->rw
## [266] 7c504e65206a - io_uring: don't wait when under-submitting
## [265] e781573e2fb1 - io_uring: warn about unhandled opcode
## [264] d625c6ee4975 - io_uring: read opcode and user_data from SQE exactly once
## [263] b29472ee7b53 - io_uring: make IORING_OP_TIMEOUT_REMOVE deferrable
## [262] fbf23849b172 - io_uring: make IORING_OP_CANCEL_ASYNC deferrable
## [261] 0969e783e3a8 - io_uring: make IORING_POLL_ADD and IORING_POLL_REMOVE deferrable
## [260] ffbb8d6b7691 - io_uring: make HARDLINK imply LINK
## [259] 8ed8d3c3bc32 - io_uring: any deferred command must have stable sqe data
## [258] fc4df999e24f - io_uring: remove 'sqe' parameter to the OP helpers that take it
## [257] b7bb4f7da0a1 - io_uring: fix pre-prepped issue with force_nonblock == true
## [256] c58c1f83436b - block: end bio with BLK_STS_AGAIN in case of non-mq devs and REQ_NOWAIT
## [255] 0b416c3e1345 - io_uring: fix sporadic -EFAULT from IORING_OP_RECVMSG
## [254] d195a66e367b - io_uring: fix stale comment and a few typos
## [253] 9e3aa61ae3e0 - io_uring: ensure we return -EINVAL on unknown opcode
## [252] 10d59345578a - io_uring: add sockets to list of files that support non-blocking issue
## [251] ebfcd8955c0b - net: make socket read/write_iter() honor IOCB_NOWAIT
## [250] 53108d476a10 - io_uring: only hash regular files for async work execution
## [249] 4a0a7a187453 - io_uring: run next sqe inline if possible
## [248] 392edb45b243 - io_uring: don't dynamically allocate poll data
## [247] d96885658d99 - io_uring: deferred send/recvmsg should assign iov
## [246] 8a4955ff1cca - io_uring: sqthread should grab ctx->uring_lock for submissions
## [245] 4e88d6e7793f - io_uring: allow unbreakable links
## [244] 0b4295b5e2b9 - io_uring: fix a typo in a comment
## [243] 4493233edcfc - io_uring: hook all linked requests via link_list
## [242] 2e6e1fde32d7 - io_uring: fix error handling in io_queue_link_head
## [241] 78076bb64aa8 - io_uring: use hash table for poll command lookups
## [240] 2d28390aff87 - io_uring: ensure deferred timeouts copy necessary data
## [239] 901e59bba9dd - io_uring: allow IO_SQE_* flags on IORING_OP_TIMEOUT
## [238] 87f80d623c6c - io_uring: handle connect -EINPROGRESS like -EAGAIN
## [237] 8cdda87a4414 - io_uring: remove io_wq_current_is_worker
## [236] 22efde599865 - io_uring: remove parameter ctx of io_submit_state_start
## [235] da8c96906990 - io_uring: mark us with IORING_FEAT_SUBMIT_STABLE
## [234] f499a021ea8c - io_uring: ensure async punted connect requests copy data
## [233] 03b1230ca12a - io_uring: ensure async punted sendmsg/recvmsg requests copy data
## [232] f67676d160c6 - io_uring: ensure async punted read/write requests copy iovec
## [231] 1a6b74fc8702 - io_uring: add general async offload context
## [230] 441cdbd5449b - io_uring: transform send/recvmsg() -ERESTARTSYS to -EINTR
## [229] 0b8c0ec7eedc - io_uring: use current task creds instead of allocating a new one
## [228] aa4c3967756c - io_uring: fix missing kmap() declaration on powerpc
## [227] 6c5c240e4126 - io_uring: add mapping support for NOMMU archs
## [226] e944475e6984 - io_uring: make poll->wait dynamically allocated
## [225] 6206f0e180d4 - io-wq: shrink io_wq_work a bit
## [224] ad6e005ca68d - io_uring: use kzalloc instead of kcalloc for single-element allocations
## [223] 7d009165550a - io_uring: cleanup io_import_fixed()
## [222] cf6fd4bd559e - io_uring: inline struct sqe_submit
## [221] cc42e0ac17d3 - io_uring: store timeout's sqe->off in proper place
## [220] d69e07793f89 - net: disallow ancillary data for __sys_{send,recv}msg_file()
## [219] 4257c8ca13b0 - net: separate out the msghdr copy from ___sys_{send,recv}msg()
## [218] 8042d6ce8c40 - io_uring: remove superfluous check for sqe->off in io_accept()
## [217] 181e448d8709 - io_uring: async workers should inherit the user creds
## [216] 311ae9e159d8 - io_uring: fix dead-hung for non-iter fixed rw
## [215] f8e85cf255ad - io_uring: add support for IORING_OP_CONNECT
## [214] c4a2ed72c9a6 - io_uring: only return -EBUSY for submit on non-flushed backlog
## [213] f9bd67f69af5 - io_uring: only !null ptr to io_issue_sqe()
## [212] b18fdf71e01f - io_uring: simplify io_req_link_next()
## [211] 944e58bfeda0 - io_uring: pass only !null to io_req_find_next()
## [210] 70cf9f3270a5 - io_uring: remove io_free_req_find_next()
## [209] 9835d6fafba5 - io_uring: add likely/unlikely in io_get_sqring()
## [208] d732447fed7d - io_uring: rename __io_submit_sqe()
## [207] 915967f69c59 - io_uring: improve trace_io_uring_defer() trace point
## [206] 1b4a51b6d03d - io_uring: drain next sqe instead of shadowing
## [205] b76da70fc375 - io_uring: close lookup gap for dependent next work
## [204] 4d7dd4629714 - io_uring: allow finding next link independent of req reference count
## [203] eb065d301e8c - io_uring: io_allocate_scq_urings() should return a sane state
## [202] bbad27b2f622 - io_uring: Always REQ_F_FREE_SQE for allocated sqe
## [201] 5d960724b0cb - io_uring: io_fail_links() should only consider first linked timeout
## [200] 09fbb0a83ec6 - io_uring: Fix leaking linked timeouts
## [199] f70193d6d8ca - io_uring: remove redundant check
## [198] d3b35796b1e3 - io_uring: break links for failed defer
## [197] b60fda6000a9 - io-wq: wait for io_wq_create() to setup necessary workers
## [196] fba38c272a03 - io_uring: request cancellations should break links
## [195] b0dd8a412699 - io_uring: correct poll cancel and linked timeout expiration completion
## [194] e0e328c4b330 - io_uring: remove dead REQ_F_SEQ_PREV flag
## [193] 94ae5e77a915 - io_uring: fix sequencing issues with linked timeouts
## [192] ad8a48acc23c - io_uring: make req->timeout be dynamically allocated
## [191] 978db57e2c32 - io_uring: make io_double_put_req() use normal completion path
## [190] 0e0702dac26b - io_uring: cleanup return values from the queueing functions
## [189] 95a5bbae05ef - io_uring: io_async_cancel() should pass in 'nxt' request pointer
## [188] eac406c61cd0 - io_uring: make POLL_ADD/POLL_REMOVE scale better
## [187] a320e9fa1e26 - io_uring: Fix getting file for non-fd opcodes
## [186] 9d858b214839 - io_uring: introduce req_need_defer()
## [185] 2f6d9b9d6357 - io_uring: clean up io_uring_cancel_files()
## [184] 5e559561a8d7 - io_uring: ensure registered buffer import returns the IO length
## [183] 5683e5406e94 - io_uring: Fix getting file for timeout
## [182] 15dff286d0e0 - io_uring: check for validity of ->rings in teardown
## [181] 7c9e7f0fe0d8 - io_uring: fix potential deadlock in io_poll_wake()
## [180] 960e432dfa59 - io_uring: use correct "is IO worker" helper
## [179] 93bd25bb69f4 - io_uring: make timeout sequence == 0 mean no sequence
## [178] 76a46e066e2d - io_uring: fix -ENOENT issue with linked timer with short timeout
## [177] 768134d4f481 - io_uring: don't do flush cancel under inflight_lock
## [176] c1edbf5f081b - io_uring: flag SQPOLL busy condition to userspace
## [175] 47f467686ec0 - io_uring: make ASYNC_CANCEL work with poll and timeout
## [174] 0ddf92e848ab - io_uring: provide fallback request for OOM situations
## [173] 8e3cca127062 - io_uring: convert accept4() -ERESTARTSYS into -EINTR
## [172] 46568e9be70f - io_uring: fix error clear of ->file_table in io_sqe_files_register()
## [171] c69f8dbe2426 - io_uring: separate the io_free_req and io_free_req_find_next interface
## [170] ec9c02ad4c38 - io_uring: keep io_put_req only responsible for release and put req
## [169] a197f664a0db - io_uring: remove passed in 'ctx' function parameter ctx if possible
## [168] 206aefde4f88 - io_uring: reduce/pack size of io_ring_ctx
## [167] 5f8fd2d3e0a7 - io_uring: properly mark async work as bounded vs unbounded
## [166] c5def4ab8494 - io-wq: add support for bounded vs unbunded work
## [165] 1d7bb1d50fb4 - io_uring: add support for backlogged CQ ring
## [164] 78e19bbef383 - io_uring: pass in io_kiocb to fill/add CQ handlers
## [163] 84f97dc2333c - io_uring: make io_cqring_events() take 'ctx' as argument
## [162] 2665abfd757f - io_uring: add support for linked SQE timeouts
## [161] e977d6d34f0c - io_uring: abstract out io_async_cancel_one() helper
## [160] 267bc90442aa - io_uring: use inlined struct sqe_submit
## [159] 50585b9a0736 - io_uring: Use submit info inlined into req
## [158] 196be95cd557 - io_uring: allocate io_kiocb upfront
## [157] e5eb6366ac2d - io_uring: io_queue_link*() right after submit
## [156] ae9428ca6127 - io_uring: Merge io_submit_sqes and io_ring_submit
## [155] 3aa5fa030558 - io_uring: kill dead REQ_F_LINK_DONE flag
## [154] f1f40853c01b - io_uring: fixup a few spots where link failure isn't flagged
## [153] 89723d0bd6c7 - io_uring: enable optimized link handling for IORING_OP_POLL_ADD
## [152] 1056ef940380 - MAINTAINERS: update io_uring entry
## [151] 51c3ff62cac6 - io_uring: add completion trace event
## [150] 0069fc6b1cf2 - io_uring: remove io_uring_add_to_prev() trace event
## [149] e9ffa5c2b77e - io_uring: set -EINTR directly when a signal wakes up in io_cqring_wait
## [148] 62755e35dfb2 - io_uring: support for generic async request cancel
## [147] 6873e0bd6a9c - io_uring: ensure we clear io_kiocb->result before each issue
## [146] 975c99a57096 - io_uring: io_wq_create() returns an error pointer, not NULL
## [145] 842f96124c56 - io_uring: fix race with canceling timeouts
## [144] 65e19f54d29c - io_uring: support for larger fixed file sets
## [143] b7620121dc04 - io_uring: protect fixed file indexing with array_index_nospec()
## [142] 17f2fe35d080 - io_uring: add support for IORING_OP_ACCEPT
## [141] fcb323cc53e2 - io_uring: io_uring: add support for async work inheriting files
## [140] 561fb04a6a22 - io_uring: replace workqueue usage with io-wq
## [139] 771b53d033e8 - io-wq: small threadpool implementation for io_uring
## [138] 95a1b3ff9a3e - io_uring: Fix mm_fault with READ/WRITE_FIXED
## [137] fa4562280889 - io_uring: remove index from sqe_submit
## [136] c826bd7a743f - io_uring: add set of tracing events
## [135] 11365043e527 - io_uring: add support for canceling timeout requests
## [134] a41525ab2e75 - io_uring: add support for absolute timeouts
## [133] ba5290ccb6b5 - io_uring: replace s->needs_lock with s->in_async
## [132] 33a107f0a1b8 - io_uring: allow application controlled CQ ring size
## [131] c3a31e605620 - io_uring: add support for IORING_REGISTER_FILES_UPDATE
## [130] 08a451739a9b - io_uring: allow sparse fixed file sets
## [129] ba816ad61fdf - io_uring: run dependent links inline if possible
## [128] 044c1ab399af - io_uring: don't touch ctx in setup after ring fd install
## [127] 7b20238d28da - io_uring: Fix leaked shadow_req
## [126] 2b2ed9750fc9 - io_uring: fix bad inflight accounting for SETUP_IOPOLL|SETUP_SQTHREAD
## [125] 498ccd9eda49 - io_uring: used cached copies of sq->dropped and cq->overflow
## [124] 935d1e45908a - io_uring: Fix race for sqes with userspace
## [123] fb5ccc98782f - io_uring: Fix broken links with offloading
## [122] 84d55dc5b9e5 - io_uring: Fix corrupted user_data
## [121] a1f58ba46f79 - io_uring: correct timeout req sequence when inserting a new entry
## [120] ef03681ae8df - io_uring : correct timeout req sequence when waiting timeout
## [119] bc808bced39f - io_uring: revert "io_uring: optimize submit_and_wait API"
## [118] 8b07a65ad30e - io_uring: fix logic error in io_timeout
## [117] 491381ce07ca - io_uring: fix up O_NONBLOCK handling for sockets
## [116] 5da0fb1ab34c - io_uring: consider the overflow of sequence for timeout req
## [115] 7adf4eaf60f3 - io_uring: fix sequence logic for timeout requests
## [114] 8a9973408177 - io_uring: only flush workqueues on fileset removal
## [113] 6805b32ec2b0 - io_uring: remove wait loop spurious wakeups
## [112] bf7ec93c644c - io_uring: fix reversed nonblock flag for link submission
## [111] bdf200731145 - io_uring: use __kernel_timespec in timeout ABI
## [110] bda521624e75 - io_uring: make CQ ring wakeups be more efficient
## [109] daa5de541584 - io_uring: compare cached_cq_tail with cq.head in_io_uring_poll
## [108] 32960613b7c3 - io_uring: correctly handle non ->{read,write}_iter() file_operations
## [107] 5262f567987d - io_uring: IORING_OP_TIMEOUT support
## [106] 9831a90ce643 - io_uring: use cond_resched() in sqthread
## [105] a1041c27b64c - io_uring: fix potential crash issue due to io_get_req failure
## [104] 6cc47d1d2a9b - io_uring: ensure poll commands clear ->sqe
## [103] 5f5ad9ced336 - io_uring: fix use-after-free of shadow_req
## [102] 954dab193d19 - io_uring: use kmemdup instead of kmalloc and memcpy
## [101] 5277deaab9f9 - io_uring: increase IORING_MAX_ENTRIES to 32K
## [100] b2a9eadab857 - io_uring: make sqpoll wakeup possible with getevents
## [99] 6d5d5ac522b2 - io_uring: extend async work merging
## [98] 54a91f3bb9b9 - io_uring: limit parallelism of buffered writes
## [97] 18d9be1a970c - io_uring: add io_queue_async_work() helper
## [96] c576666863b7 - io_uring: optimize submit_and_wait API
## [95] 4fe2c963154c - io_uring: add support for link with drain
## [94] 8776f3fa15a5 - io_uring: fix wrong sequence setting logic
## [93] ac90f249e15c - io_uring: expose single mmap capability
## [92] 0a56e0603fa1 - perf arch powerpc: Sync powerpc syscall.tbl
## [91] 75b28affdd6a - io_uring: allocate the two rings together
## [90] 27c4d3a3252f - fs/io_uring.c: convert put_page() to put_user_page*()
## [89] 08f5439f1df2 - io_uring: add need_resched() check in inner poll loop
## [88] a3a0e43fd770 - io_uring: don't enter poll loop if we have CQEs pending
## [87] 500f9fbadef8 - io_uring: fix potential hang with polled IO
## [86] 77cd0d7b3f25 - xsk: add support for need_wakeup flag in AF_XDP rings
## [85] a982eeb09b60 - io_uring: fix an issue when IOSQE_IO_LINK is inserted into defer list
## [84] 99c79f6692cc - io_uring: fix manual setup of iov_iter for fixed buffers
## [83] d0ee879187df - io_uring: fix KASAN use after free in io_sq_wq_submit_work
## [82] 36703247d5f5 - io_uring: ensure ->list is initialized for poll commands
## [81] 9310a7ba6de8 - io_uring: track io length in async_list based on bytes
## [80] bd11b3a391e3 - io_uring: don't use iov_iter_advance() for fixed buffers
## [79] c0e48f9dea91 - io_uring: add a memory barrier before atomic_read
## [78] f7b76ac9d17e - io_uring: fix counter inc/dec mismatch in async_list
## [77] dbd0f6d6c2a1 - io_uring: fix the sequence comparison in io_sequence_defer
## [76] a4c0b3decb33 - io_uring: fix io_sq_thread_stop running in front of io_sq_thread
## [75] aa1fa28fc73e - io_uring: add support for recvmsg()
## [74] 0fa03c624d8f - io_uring: add support for sendmsg()
## [73] 9e645e1105ca - io_uring: add support for sqe links
## [72] 60c112b0ada0 - io_uring: ensure req->file is cleared on allocation
## [71] 355e8d26f719 - io_uring: fix memory leak of UNIX domain socket inode
## [70] 9d93a3f5a0c0 - io_uring: punt short reads to async context
## [69] f95d050cdc5d - perf arm64: Fix mksyscalltbl when system kernel headers are ahead of the kernel
## [68] a278682dad37 - io_uring: Fix __io_uring_register() false success
## [67] 004d564f9087 - tools/io_uring: sync with liburing





## [66] 486f069253c3 - tools/io_uring: fix Makefile for pthread library link
## [65] 1cdc415f1083 - uapi, fsopen: use square brackets around "fscontext" [ver #2]

详见commit message



## [64] fdb288a679cd - io_uring: use wait_event_interruptible for cq_wait conditional wait

使用wait_event_interruptible替代原来的prepare_to_wait+schedule+finish_wait



## [63] dc6ce4bc2b35 - io_uring: adjust smp_rmb inside io_cqring_events

代码没有发生任何变化，就是调整了代码位置



## [62] 2bbcd6d3b36a - io_uring: fix infinite wait in khread_park() on io_finish_async()

详见commit message

一般挂起流程是kthread_park - kthread_should_park - kthread_parkme（这时候才算真正挂起了），kthread_park会wait kthread_parkme的completition

prepare_to_wait准备休眠，schedule主动休眠，finish_wait结束休眠

io_sq_thread - kthread_should_park  - kthread_parkme
             - !kthread_should_park - io_get_sqring  - io_submit_sqes
                                    - !io_get_sqring - prepare_to_wait - io_get_sqring - finish_wait(说明IO有了不能休眠了) - io_submit_sqes
                                                                       - !io_get_sqring - kthread_should_park - kthread_parkme
                                                                                        - !kthread_should_park - schedule（休眠）- finish_wait（说明被wakeup,进入下一循环）
## [61] c71ffb673cd9 - io_uring: remove 'ev_flags' argument
## [60] 44a9bd18a0f0 - io_uring: fix failure to verify SQ_AFF cpu

详见commit message



## [59] e2033e33cb38 - io_uring: fix race condition reading SQE data

说是有竞态，但没看出来，应该大意是原来的REQ_F_PREPPED可以使得-EAGAIN进入workqueue调度时不需要重新准备req但这样会导致req一些字段沿用了之前的内容导致了异常行为，所以去掉了REQ_F_PREPPED，每一次都重新准备req，虽然会带来些性能损失



## [58] 214828962dea - io_uring: initialize percpu refcounters using PERCU_REF_ALLOW_REINIT

详见commit message, 不过PERCPU_REF_ALLOW_REINIT看linux代码这个flag好像没什么作用



## [57] 7889f44dd9ce - io_uring: use cpu_online() to check p->sq_thread_cpu instead of cpu_possible()

cpu_possible没有考虑到下线的cpu情况，用cpu_online判断是否在线可调度更合理



## [56] efeb862bd5bc - io_uring: fix shadowed variable ret return code being not checked

详见commit message



## [55] e87eb301bee1 - blk-mq: grab .q_usage_counter when queuing request from plug code path

rt



## [54] 9b402849e80c - io_uring: add support for eventfd notifications

支持eventfd注册减少频繁的引用申请和释放，与之前的io_uring_register注册的buff，file等类似



## [53] 5d17b4a4b7fa - io_uring: add support for IORING_OP_SYNC_FILE_RANGE

支持io_uring模式下的sync_file_range



## [52] de0617e46717 - io_uring: add support for marking commands as draining

支持IOSQE_IO_DRAIN可以保证只有在前面的IO做完之后才提交当前的IO,判断方式为在提交时设置seq，判断方式为seq是否比cq_tail+dropped更大，seq记录为前一个IO的head（cached_sq_head - 1，因为当前sq已经使得cached_sq_head++，那么-1就代表是当前的IO的head，从0开始），cq_tail+dropped即已做完的IO的head除去无效的IO,如果seq>cq_tail+dropped那就说明前一个已经做完了

如果需要drain那么设置req flag为REQ_F_IO_DRAIN，完成后设置为REQ_F_IO_DRAINED，比起完成后设置为～REQ_F_IO_DRAIN这样如果drained的req做完再判断的时候就不需要特殊处理了

io_submit_sqe - !io_sequence_defer(ctx, req) && list_empty(&ctx->defer_list)(即当前没有drain且没有已被drain阻塞的任务，就可以直接做) - __io_submit_sqe
              - 相反地 - 放到defer_list
                                      - io_commit_cqring(每个cq产生都判断defer_list队首的IO是否可以开始，如果可以则进wq) - io_sq_wq_submit_work

## [51] d4ef647510b1 - io_uring: avoid page allocation warnings

用kvmalloc_array替代kmalloc_array来同时适应大内存和小内存的分配



## [50] 817869d2519f - io_uring: drop req submit reference always in async punt

解决__io_submit_sqe失败下没有没有释放提交引用导致的内存泄漏，换个思路就是只要req提交成功就应该释放，然后提交失败的req马上释放本身的引用，提交成功的req在后处理释放本身的引用



## [49] 52e04ef4c9d4 - io_uring: free allocated io_memory once

ctx->sq_*字段内存分配失败的时候会多次free，修复了这个问题



## [48] 975554b03edd - io_uring: fix SQPOLL cpu validation

NR_CPUS表示内核​理论上支持的最大CPU数量,由内核配置选项 CONFIG_NR_CPUS 定义, nr_cpu_ids表示​当前系统中可能存在的最大 CPU 逻辑编号

用nr_cpu_ids代替NR_CPUS()，最后用返回值来判断，确实比反复判断原来值更合理



## [47] 5c8b0b54db22 - io_uring: have submission side sqe errors post a cqe

详见commit message



## [46] 62977281a638 - io_uring: remove unnecessary barrier after unsetting IORING_SQ_NEED_WAKEUP

对于IORING_SQ_NEED_WAKEUP这个flag，不管什么情况都可能会有冲突，所以这里的内存屏障没什么意义



## [45] b841f19524a1 - io_uring: remove unnecessary barrier after incrementing dropped counter
## [44] 82ab082c0e2f - io_uring: remove unnecessary barrier before reading SQ tail
## [43] 9e4c15a39394 - io_uring: remove unnecessary barrier after updating SQ head

已经通过smp_store_release和smp_load_acquire保证了，没必要做两次内存屏障



## [42] 115e12e58dbc - io_uring: remove unnecessary barrier before reading cq head

我理解是ring->r.head是增长的，而tail由kernel控制，那么如果head先读，那么head其实<= read head，对于cq满了的判断其实更有好处，因为如果真满了，那么此时也必然是不成立，所以这里的内存屏障其实没必要



## [41] 4f7067c3fb7f - io_uring: remove unnecessary barrier before wq_has_sleeper

看linux/include/linux/wait.h中wq_has_sleeper的源码包含了smp_mb()，所以不需要在wq_has_sleeper前再做同步了



## [40] 1e84b97b7377 - io_uring: fix notes on barriers

修改注解，尤其关于内存屏障相关的内容



## [39] 8449eedaa1da - io_uring: fix handling SQEs requesting NOWAIT

原来操作：不是cached不能立马做完的都会放到workqueue，那么现在如果用户read/write的时候要求NOWAIT,那么不会放入wq，就会直接报错



## [38] 8358e3a8264a - io_uring: remove 'state' argument from io_{read,write} path

rt



## [37] fb775faa9e46 - io_uring: fix poll full SQ detection

和[33] 74f464e97044的修改一样，原来的修改如果是u32这种溢出回转的应该没问题，但ring_entries是按照用户给定的设置的，因此不能这样使用



## [36] 0d7bae69c574 - io_uring: fix race condition when sq threads goes sleeping

严格保证先写IORING_SQ_NEED_WAKEUP再去看tail是否还有sqe可以执行，避免先发现sqe可以执行，将IORING_SQ_NEED_WAKEUP回退然后再写IORING_SQ_NEED_WAKEUP导致sq thread陷入睡眠的情况



## [35] e523a29c4f27 - io_uring: fix race condition reading SQ entries

x86：强内存模型（TSO），保证Store-Store顺序；ARM：弱内存模型（Weak Ordering），允许Store-Store重排，"memory" 只约束编译器重排，dmb ishst 同时约束编译器和CPU内存访问顺序

smp_load_acquire看了下linux/include/asm-generic/barrier.h里面的实现，是先读再mb()，而smp_store_release是先mb()再写

与queue.c中的io_uring_submit的*sq->ktail = ktail;的前写屏障对应，user要保证先写array再写tail，那么kernel要保证先读tail再读array，如果是read_once，可能出现先读sq entry再读tail的情况，下面这种情况：用户sq entry写到一半 -> kernel读sq entry(异常值) -> 用户sq entry写完 -> 用户写tail -> kernel读tail，那么kernel认为tail是合理的但是会读出异常的sq entry导致问题



## [34] 35fa71a030ca - io_uring: fail io_uring_register(2) on a dying io_uring instance

如果同时进入io_uring_register，那么只需要保留一个做就可以了，其他的可以直接返回



## [33] 74f464e97044 - io_uring: fix CQ overflow condition

看了cm(commit message)盲猜是tail远远超过head的情况，但是tail和head的差值应该是小于ring->ring_entries的，所以会导致sqe->off越界



## [32] b19062a56726 - io_uring: fix possible deadlock between io_uring_{enter,register}

__io_uring_register的调用点持锁了，避免io_uring_enter和io_uring_register同时发生可能的死锁问题，先释放锁因为这时候是安全的不会重入



## [31] 39036cd27273 - arch: add pidfd and io_uring syscalls everywhere

将io_uring从x86推广到其他所有架构



## [30] 3d6770fbd935 - io_uring: drop io_file_put() 'file' argument

rt



## [29] 917257daa0fe - io_uring: only test SQPOLL cpu after we've verified it

只在IORING_SETUP_SQPOLL下使用到sq_thread_idle，因此将sq_thread_idle设置放到IORING_SETUP_SQPOLL下

判断cpu_possible避免在未使用的cpu上创建内核线程



## [28] 060586324648 - io_uring: park SQPOLL thread if it's percpu

通过kthread_should_park和kthread_parkme确保内核线程能够在系统暂停情况下预期停车



## [27] 3ec482d15cb9 - io_uring: restrict IORING_SETUP_SQPOLL to root

rt



## [26] 704236672eda - tools/io_uring: remove IOCQE_FLAG_CACHEHIT

rt



## [25] 25adf50fe25d - io_uring: fix double free in case of fileset regitration failure

rt(如题)



## [24] 8142bd82a59e - tools headers: Update x86's syscall_64.tbl and uapi/asm-generic/unistd

perf trace -s io_uring-cp ~acme/isos/RHEL-x86_64-dvd1.iso ~/bla

perf trace -e io_uring* -s io_uring-cp ~acme/isos/RHEL-x86_64-dvd1.iso ~/bla



## [23] 9bf7933fc3f3 - io_uring: offload write to async worker in case of -EAGAIN

将[12] 31b515106428实现的io_read优化复刻到io_write



## [22] 9e75ad5d8f39 - io_uring: fix big-endian compat signal mask handling

详见commit message



## [21] bf33a7699e99 - io_uring: mark me as the maintainer

add maintainer



## [20] fd6fab2cb78d - io_uring: retry bulk slab allocs as single allocs

增加kmem_cache_alloc_bulk分配失败就用kmem_cache_alloc重试分配一个的处理



## [19] 8c838788775a - io_uring: fix poll races

详见commit message



## [18] 09bb839434bd - io_uring: fix fget/fput handling

把文件管理放到更高层次，统一处理



## [17] d530a402a114 - io_uring: add prepped flag

用req->flags & REQ_F_PREPPED代替kiocb->ki_filp来判断是否prepped



## [16] e0c5c576d507 - io_uring: make io_read/write return an integer

详见commit message



## [15] e65ef56db494 - io_uring: use regular request ref counts

使用ref_count来管理req的全生命周期，每个req初始化2个ref，如果req已提交，那么ref--，如果req异常退出或者正常结束，再ref--



## [14] b5420237ec81 - mm: refactor readahead defines in mm.h

详见commit message



## [13] 21b4aa5d20fd - io_uring: add a few test tools

封装了liburing和增加了两个用户态用例：
- 一个是io_uring_bench，命令：bench file1 file2 file3, 测试批量文件读写的IOPS，包含了fixed_buffer/fixed_file, IOPOLL,SQPOLL等各种模式功能测试
- 一个是io_uring_cp，命令：cp A B，测试最基础的io_uring的功能

用户态发一个sqe，先放到sqes,然后增长sqe_tail，到用io_uring_enter提交前，逐个获取sqe，将sqe的head填充到sq array，增长seq_head，最后增长sq->tail，提交到kernel,kernel处理一个sqe就增长sq->head

cq同理，kernel提交一个cqe，就增长cq->tail，用户态处理一个cqe，就增长cq->head

通过to_submit和min_complete来控制提交和wait，也就是to_submit非0那么就是提交任务，然后min_complete非0，就代表要等待完成min_complete个completion event

通过cqe->res直接填充内核IO操作的结果，供用户态判断进行下一步处理

cqe->user_data就是sqe->user_data,可以包含read/write等任何想要的信息来用作completion event完成后供用户近一步判断

通过setrlimit（RLIMIT_MEMLOCK）可以解开进程锁定内存限制

SQPOLL提交完就会返回系统调用,然后在reap_events中一直检查完成，而非SQPOLL，在完成后才会将io_uring_enter这个系统调用返回

通过f->pending_ios >= file_depth(s)来控制可以将多少个sq分给同一个文件，比如有sq有100个坑位，有10个文件，那么当累积到第11个后就会跳到第二个文件



## [12] 31b515106428 - io_uring: allow workqueue item to handle multiple buffered requests

<u>增加pending_async将同一文件连续的读写请求合并，因为每一个io都增加一个work到workqueue有性能损失，如果是连续的可以把多个work合并成一个，也就是只用于workqueue的场景，不适用IORING_SETUP_SQPOLL和IORING_SETUP_IOPOLL</u>

<u>虽然每个async_list中的req依旧是一个个读，但是顺序缓冲IO的额外好处是会触发预读和更好的连续写入响应，所以顺序缓冲IO后续操作实际不会花费很久</u>

每一次的async_list->io_end都设为当前io的末尾位置，也就是每一次只比较前一个是不是连续的

同时限制了异步IO的读写页面数量，用REQ_F_SEQ_PREV控制避免一次读写大量IO页面带来的性能损失

<u>通过list_splice_init将async_list转移到req_list，减少处理req的锁的临界区占用，提升性能</u>

## [11] 221c5eb23382 - io_uring: add support for IORING_OP_POLL
## [10] c16361c1d805 - io_uring: add io_kiocb ref count

除了readv/writev等，增加了one-shot poll，即支持poll一个，新的需要重新poll

<u>list_del_init重新初始化链表避免内存泄漏等异常行为</u>

IORING_OP_POLL_ADD  - io_poll_complete_work(one-shot poll情况下直接提交给原先相同的workqueue但是work不一样)
!IORING_OP_POLL_ADD - io_sq_wq_submit_work

io_poll_remove/io_poll_remove_all - io_poll_remove_one(canceled) - io_poll_complete_work - add_wait_queue

                                    io_poll_wake                 - io_poll_complete_work - io_poll_complete

io_poll_queue_proc - add_wait_queue



## [9] 6c271ce2f1d5 - io_uring: add submission polling

支持IORING_SETUP_SQPOLL，用户可以提交IO不需要每次都通过io_uring_enter系统调用，就会自动获取sq_ring

用kthread（io_sq_thread）来自动获取sq_ring，同时支持用IORING_SETUP_SQ_AFF来绑核

<u>支持设置超时时间，超时后设置IORING_SQ_NEED_WAKEUP，进入wait状态，需要用户重新下发io_uring_enter系统调用带上IORING_ENTER_SQ_WAKEUP才会重新唤醒</u>

```
IORING_SETUP_SQPOLL  - io_sq_thread(内核线程)          - io_submit_sqes - io_submit_sqe
                                                       - IORING_SETUP_IOPOLL  - io_iopoll_check
                     - no wait cq

!IORING_SETUP_SQPOLL - to_submit（submit sq）          - io_ring_submit - io_submit_sqe - （cached IO 直接提交/io_sq_wq_submit_work(non-cached IO 放到wq异步提交)）- __io_submit_sqe(cached IO 直接提交) - IORING_SETUP_IOPOLL(提交给ctx->poll_list)
                     - IORING_ENTER_GETEVENTS(wait cq) - IORING_SETUP_IOPOLL  - io_iopoll_check(轮询)      - io_complete_rw_iopoll
                                                       - !IORING_SETUP_IOPOLL - prepare_to_wait(等待中断)  - io_complete_rw
```



## [8] 6b06314c47e1 - io_uring: add file set registration
## [7] f4e65870e5ce - net: split out functions related to registering inflight socket files

在原来的系统调用io_uring_register中增加支持map fd，省去相同文件的引用增加释放开销，同时要求map fd后传入IOSQE_FIXED_FILE，这样才会避免重新增加文件引用，算是上一步的性能进一步思考



## [6] edafccee56ff - io_uring: add support for pre-mapped user IO buffers

<u>新增系统调用io_uring_register，支持将固定的user buf map到kernel，然后pin住，这样kernel就可以直接读写到这块user_buf，省去频繁的内存映射和解映射（对比每次IO都是读写不同的内存）</u>

同样用了RLIMIT_MEMLOCK来控制pin住的内存大小



## [5] 2579f913d41a - io_uring: batch io_kiocb allocation

使用kmem_cache_alloc_bulk，批量分配to_commit下的req



## [4] 9a56a2323dbb - io_uring: use fget/fput_many() for file references

增加了io_submit_state，主要是为了解决两个问题：1）在to_commit > IO_PLUG_THRESHOLD的批量提交情况下，缓存批处理文件引用，减少频繁的申请释放 2）应对批量情况下有多个fd读写的情况，给每个fd增加剩余批量数的引用（没看出来必要性）



## [3] def596e9557c - io_uring: support for IO polling

增加了对IORING_SETUP_IOPOLL的支持，即可以直接通过io_uring_enter完成IO下发以及通过用户轮询poll等待完成，而之前是通过中断的方式wake_up，高频率下IO延迟更低

<u>通过needs_lock将direct和workqueue情况下区分是否加锁，控制不同粒度下的uring_lock的添加</u>

cond_resched自愿让出cpu，提高系统响应性，避免softlockup

io_iopoll_req_issued将执行完成的放到ctx->poll_list队列头，未完成的放到队列尾

<u>io_do_iopoll通过list_move_tail将ctx->poll_list从头开始已完成的放到done这个新的队列中，未完成的就调用IO设备的iopoll，最后统一处理done队列提交给cq</u>

<u>kmem_cache_free_bulk批量释放一组slab缓存分配的对象，提高效率</u>



## [2] c992fe2925d7 - io_uring: add fsync support

除了原来的nop/readv/writev，还增加了fsync的支持



## [1] 2b188cc1bb85 - Add io_uring IO interface

提交了两个系统调用io_uring_setup/io_uring_enter

<u>ctx->refs是percpu的，避免多核带来的锁征用，且用cacheline对齐，避免伪共享</u>

sq放的是io_uring_sqe array的索引，这样就可以批量提交一堆不连续的sqe的IOs，所以sq ring/cqring/sqe array会有这三份内存

通过一次io_uring_setup告诉user分别的offset，支持用户去mmap这些内容

<u>调用io_account_mem根据CAP_IPC_LOCK以及RLIMIT_MEMLOCK决定是否lock用户申请的内存</u>

<u>限制workqueue的cpu核心数，避免过多的并发任务可能导致上下文切换开销过大，从而降低系统的整体性能。</u>

to_submit如果超过2说明是批量提交，那么就会blk_start_plug/blk_finish_plug成批量提交来提高blk的性能

因为sq放到的是sqe array的索引，所以io_get_sqring第一次先读sq_ring的head，获取到sq_ring里面要执行的sqe array中的head(index)，然后通过sqe array中的head获取到实际的sqe

io_submit_sqe逻辑是判断当前的io是否是cached,如果是direct那么就直接io读写，如果不是那么就queue_work放到workqueue中去做避免阻塞

fd = READ_ONCE(sqe->fd);因为sqe是kernel和user的共享内存，在没有锁的情况下，通过read_once保证读取是原子且唯一的

io_read有重试的机会，而io_write失败了就是失败了，io_rw_done是直接回调写，而读是先读失败了否则non-block就会放到workqueue中

<u>先判断waitqueue_active再去wake_up可以避免无等待进程进程，减少同步开销提升性能</u>

加入fasync机制，通过SIGIO信号通知用户空间处理程序

<u>通过virt_to_head_page处理复合页</u>

传入IORING_ENTER_GETEVENTS那么就会等待cq，也就是可以通过这个来wait cqe
